export interface PaymentResult {
    id: string;
    status: 'succeeded' | 'pending' | 'canceled';
    paid: boolean;
    amount: {
        value: string;
        currency: string;
    };
}

export default interface PaymentService {
    createPayment(
        amount: number,
        currency: string,
        consultationId: number,
        description: string,
        userId: number
    ): Promise<{ id: string; confirmationUrl: string }>;

    processWebhook(signature: string, rawBody: any): Promise<PaymentResult>;
    validateWebhookSignature(signature: string, rawBody: string): boolean;
}