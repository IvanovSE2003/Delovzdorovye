// consultation.timer.service.ts
import { Server } from 'socket.io';
import TimerService from '../../domain/services/timer.service';
import ConsultationRepository from '../../domain/repositories/consultation.repository';
import TimeSlotRepository from '../../domain/repositories/timeSlot.repository';

export default class TimerServiceImpl implements TimerService{
    private timers = new Map<number, NodeJS.Timeout>();
    
    constructor(
        private consultationRepository: ConsultationRepository,
        private timeSlotRepository: TimeSlotRepository,
        private io?: Server
    ) {}

    startTimer(consultationId: number, expiresAt: Date) {
        const timeLeft = expiresAt.getTime() - Date.now();
        
        if (timeLeft <= 0) {
            this.cancelConsultation(consultationId);
            return;
        }

        const timer = setTimeout(async () => {
            await this.cancelConsultation(consultationId);
            this.timers.delete(consultationId);
        }, timeLeft);

        this.timers.set(consultationId, timer);

        this.sendTimeUpdate(consultationId, timeLeft);
    }

    private sendTimeUpdate(consultationId: number, timeLeft: number) {
        if (this.io) {
            this.io.to(`consultation-${consultationId}`).emit('time-update', {
                consultationId,
                timeLeft,
                expiresAt: new Date(Date.now() + timeLeft)
            });
        }
    }

    private async cancelConsultation(consultationId: number) {
        try {
            const consultation = await this.consultationRepository.findById(consultationId);
            if (consultation && consultation.payment_status === 'pending') {
                consultation.setPayStatus('cancelled');
                consultation.setConsultStatus('cancelled');
                await this.consultationRepository.update(consultation.id, consultation);

                if (consultation.timeSlotId) {
                    const timeSlot = await this.timeSlotRepository.findById(consultation.timeSlotId);
                    if (timeSlot) {
                        timeSlot.isAvailable = true;
                        await this.timeSlotRepository.update(timeSlot);
                    }
                }

                if (this.io) {
                    this.io.to(`consultation-${consultationId}`).emit('consultation-cancelled', {
                        consultationId,
                        reason: 'Время оплаты истекло'
                    });
                }
            }
        } catch (error) {
            console.error('Error cancelling consultation:', error);
        }
    }

    stopTimer(consultationId: number) {
        const timer = this.timers.get(consultationId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(consultationId);
        }
    }

    async restoreTimers() {
        const pendingConsultations = await this.consultationRepository.findAll(1, 1000, {
            payment_status: 'pending'
        });

        for (const consultation of pendingConsultations.consultations) {
            if (consultation.reservation_expires_at && !consultation.isExpired()) {
                this.startTimer(consultation.id, consultation.reservation_expires_at);
            } else if (consultation.isExpired()) {
                await this.cancelConsultation(consultation.id);
            }
        }
    }
}