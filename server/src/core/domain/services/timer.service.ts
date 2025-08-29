export default interface TimerService {
    startTimer(consultationId: number, expiresAt: Date): void;
    stopTimer(consultationId: number): void;
    restoreTimers(): Promise<void>;
}