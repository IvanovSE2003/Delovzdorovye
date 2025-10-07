import { clients } from '../../../main';
import { WebSocket } from 'ws';

export async function sendNotificationCount(userId: number, count: number) {
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'notifications_count',
            userId,
            count,
            timestamp: Date.now()
        }));
    }
}