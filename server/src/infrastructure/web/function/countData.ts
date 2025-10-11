import { clients } from '../../../main';
import { WebSocket } from 'ws';

export async function sendNotificationCount(userId: number, count: number, type: string) {
    try {
        const clientEntry = Array.from(clients.entries())
            .find(([userData]) => userData.userId === userId);

        if (!clientEntry) {
            console.warn(`[WS] User ${userId} not connected`);
            return;
        }

        const [userData, ws] = clientEntry;

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type,
                count
            }));
        } else {
            console.warn(`[WS] Cannot send ${type} to ${userId}, socket not open`);
        }
    } catch (err) {
        console.error(`[WS] Failed to send ${type} to ${userId}:`, err);
    }
}
