import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:5000"; // URL вашего сервера
let socket: Socket;

export const connectToVideoConference = (roomId: string, userId: number, role: string) => {
    socket = io(SERVER_URL, {
        query: { roomId, userId, role },
        transports: ["websocket"]
    });

    socket.on("connect", () => {
        console.log("Подключено к видеоконференции, socket id:", socket.id);
    });

    socket.on("participantJoined", (participant) => {
        console.log("Новый участник:", participant);
    });

    socket.on("participantLeft", (participant) => {
        console.log("Участник вышел:", participant);
    });

    socket.on("disconnect", () => {
        console.log("Отключено от видеоконференции");
    });
};

export const disconnectFromVideoConference = () => {
    if (socket) {
        socket.disconnect();
    }
};
