import { clients } from '../../../main';
import { WebSocket } from 'ws';

export async function broadcastNotificationCount(count: number, type: string) {
    try {
        for (const [userData, ws] of clients) {
            if (userData.role === 'ADMIN' && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type,
                    count
                }));
            }
        }
    } catch (err) {
        console.error(`[WS] Failed to broadcast ${type} to admins:`, err);
    }
}
