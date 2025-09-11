// // infrastructure/services/yookassa-payment.service.ts
// import { v4 as uuidv4 } from 'uuid';
// // import * as yooKassa from 'yookassa';
// import PaymentService, { PaymentResult } from '../../domain/services/payment.service.js';

// const YooKassa = yooKassa;

// export default class YooKassaPaymentService implements PaymentService {
//     private yooKassa;

//     constructor(shopId: string, secretKey: string) {
//         this.yooKassa = new YooKassa({
//             shopId,
//             secretKey,
//         });
//     }

//     async createPayment(
//         amount: number,
//         currency: string,
//         consultationId: number,
//         description: string,
//         userId: number
//     ): Promise<{ id: string; confirmationUrl: string }> {

//         const payment = await this.yooKassa.createPayment({
//             amount: {
//                 value: amount.toFixed(2),
//                 currency: currency.toUpperCase(),
//             },
//             payment_method_data: {
//                 type: 'bank_card',
//             },
//             confirmation: {
//                 type: 'redirect',
//                 return_url: `${process.env.CLIENT_URL}/consultation/${consultationId}?payment=success`,
//             },
//             capture: true,
//             description: description,
//             metadata: {
//                 consultationId,
//                 userId,
//             },
//         }, uuidv4());

//         return {
//             id: payment.id,
//             confirmationUrl: payment.confirmation.confirmation_url,
//         };
//     }

//     async processWebhook(signature: string, rawBody: any): Promise<PaymentResult> {
//         // В ЮKassa webhook приходит с типом 'notification'
//         if (rawBody.event !== 'payment.succeeded') {
//             throw new Error('Unsupported event type');
//         }

//         const paymentObject = rawBody.object;
//         return {
//             id: paymentObject.id,
//             status: paymentObject.status,
//             paid: paymentObject.paid,
//             amount: paymentObject.amount,
//         };
//     }

//     validateWebhookSignature(signature: string, rawBody: string): boolean {
//         // ЮKassa подписывает webhooks, проверяйте подпись!
//         // Логика проверки зависит от провайдера.
//         // Для ЮKassa: https://yookassa.ru/developers/using-api/webhooks#security
//         return true; // Заглушка. Реализуйте проверку!
//     }
// }