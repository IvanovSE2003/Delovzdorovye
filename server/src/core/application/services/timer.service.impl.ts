// import TimerService from '../../domain/services/timer.service';
// import ConsultationRepository from '../../domain/repositories/consultation.repository';
// import TimeSlotRepository from '../../domain/repositories/timeSlot.repository';

// interface WebSocketClient {
//     send(data: string): void;
//     readyState: number;
// }

// interface ConsultationTimer {
//     consultationId: number;
//     expiresAt: Date;
// }

// export default class TimerServiceImpl implements TimerService {
//     private activeTimers = new Map<number, ConsultationTimer>();
//     private clients = new Map<string, WebSocketClient>();
//     private globalInterval: number | null = null;

//     constructor(
//         private consultationRepository: ConsultationRepository,
//         private timeSlotRepository: TimeSlotRepository,
//     ) { }

//     addClient(userId: string, ws: WebSocketClient) {
//         this.clients.set(userId, ws);
//     }

//     removeClient(userId: string) {
//         this.clients.delete(userId);
//     }

//     private sendToUser(userId: string, event: string, data: any) {
//         const client = this.clients.get(userId);
//         if (client && client.readyState === 1) {
//             client.send(JSON.stringify({ event, data }));
//         }
//     }

//     private startGlobalInterval() {
//         if (this.globalInterval !== null) return;

//         this.globalInterval = setInterval(() => {
//             this.updateAllTimers();
//         }, 1000) as unknown as number;
//     }

//     private stopGlobalIntervalIfNeeded() {
//         if (this.activeTimers.size === 0 && this.globalInterval !== null) {
//             clearInterval(this.globalInterval);
//             this.globalInterval = null;
//         }
//     }

//     private updateAllTimers() {
//         const now = Date.now();

//         this.activeTimers.forEach((timer, consultationId) => {
//             const timeLeft = timer.expiresAt.getTime() - now;

//             if (timeLeft <= 0) {
//                 this.completeTimer(consultationId);
//                 return;
//             }

//             if (timeLeft % 5000 < 1000) {
//                 this.sendTimeUpdate(consultationId, timeLeft);
//             }
//         });
//     }

//     private async completeTimer(consultationId: number) {
//         await this.cancelConsultation(consultationId);
//         this.activeTimers.delete(consultationId);
//         this.stopGlobalIntervalIfNeeded();
//     }

//     startTimer(consultationId: number, expiresAt: Date) {
//         const timeLeft = expiresAt.getTime() - Date.now();

//         if (timeLeft <= 0) {
//             this.cancelConsultation(consultationId);
//             return;
//         }

//         this.activeTimers.set(consultationId, {
//             consultationId,
//             expiresAt
//         });

//         this.startGlobalInterval();
//         this.sendTimeUpdate(consultationId, timeLeft);
//     }

//     private sendTimeUpdate(consultationId: number, timeLeft: number) {
//         const message = JSON.stringify({
//             event: 'time-update',
//             data: {
//                 consultationId,
//                 timeLeft,
//                 expiresAt: new Date(Date.now() + timeLeft)
//             }
//         });

//         this.clients.forEach((client) => {
//             if (client.readyState === 1) {
//                 client.send(message);
//             }
//         });
//     }

//     private async cancelConsultation(consultationId: number) {
//         try {
//             const consultation = await this.consultationRepository.findById(consultationId);
//             if (consultation && consultation.payment_status === "PAYMENT") {
//                 await this.consultationRepository.update(
//                     consultation.setPayStatus("NOTPAID").setConsultStatus("ARCHIVE")
//                 );

//                 const cancelMessage = JSON.stringify({
//                     event: 'consultation-cancelled',
//                     data: {
//                         consultationId,
//                         reason: 'Время оплаты истекло'
//                     }
//                 });

//                 this.clients.forEach((client) => {
//                     if (client.readyState === 1) {
//                         client.send(cancelMessage);
//                     }
//                 });
//             }
//         } catch (error) {
//             console.error('Error cancelling consultation:', error);
//         }
//     }

//     stopTimer(consultationId: number) {
//         this.activeTimers.delete(consultationId);
//         this.stopGlobalIntervalIfNeeded();
//     }

//     async restoreTimers() {
//         const pendingConsultations = await this.consultationRepository.findAll(1, 1000, {
//             payment_status: 'pending'
//         });

//         for (const consultation of pendingConsultations.consultations) {
//             if (consultation.reservation_expires_at && !consultation.isExpired()) {
//                 this.startTimer(consultation.id, consultation.reservation_expires_at);
//             } else if (consultation.isExpired()) {
//                 await this.cancelConsultation(consultation.id);
//             }
//         }
//     }

//     cleanup() {
//         if (this.globalInterval !== null) {
//             clearInterval(this.globalInterval);
//             this.globalInterval = null;
//         }
//         this.activeTimers.clear();
//     }
// }