import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (roomId: string, userId: number, userRole: string): Socket => {
    if (!socket) {
        socket = io("http://localhost:5000", {
            query: { roomId, userId, userRole },
            transports: ["websocket"]
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};