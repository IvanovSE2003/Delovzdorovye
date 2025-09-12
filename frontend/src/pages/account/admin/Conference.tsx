import { useEffect, useState } from "react";
import AccountLayout from "../AccountLayout";
import { connectSocket } from "../../../socket/soket";
import ConsultationService from "../../../services/ConsultationService";
import { Socket } from "socket.io-client";

interface Room {
    roomId: string;
    consultationId: number;
}

const AnotherProblem = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [participants, setParticipants] = useState<Array<{ userId: number; role: string }>>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

    const [inputUserId, setInputUserId] = useState<number | "">(9);
    const [inputUserRole, setInputUserRole] = useState<"DOCTOR" | "PATIENT">("DOCTOR");

    useEffect(() => {
        fetchRooms();
        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleJoin = (p: { userId: number; role: string }) => {
            setParticipants(prev => {
                if (prev.some(u => u.userId === p.userId)) return prev; // защита от дублей
                return [...prev, p];
            });
        };

        const handleLeave = (p: { userId: number }) => {
            setParticipants(prev => prev.filter(u => u.userId !== p.userId));
        };

        socket.on("participantJoined", handleJoin);
        socket.on("participantLeft", handleLeave);

        return () => {
            socket.off("participantJoined", handleJoin);
            socket.off("participantLeft", handleLeave);
        };
    }, [socket]);

    const fetchRooms = async () => {
        try {
            const data = await ConsultationService.getRooms(); // нужно реализовать метод в сервисе
            setRooms(data);
        } catch (err) {
            console.error("Ошибка при получении комнат:", err);
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        try {
            const consultationId = 26; // или получаем из комнаты
            await ConsultationService.joinRoom(consultationId, inputUserId as number, inputUserRole);

            const newSocket = connectSocket(roomId, inputUserId as number, inputUserRole);
            setSocket(newSocket);
            setCurrentRoomId(roomId);

            newSocket.on("connect", () => setConnected(true));
            newSocket.on("disconnect", () => setConnected(false));

            newSocket.on("participantJoined", (p) => {
                console.log("join: ", p)
                setParticipants((prev) => [...prev, p])
            });
            newSocket.on("participantLeft", (p) => {
                console.log("leave: ", p)
                setParticipants((prev) => prev.filter(u => u.userId !== p.userId))
            });

            const currentParticipants = await ConsultationService.getParticipants(consultationId);
            setParticipants(currentParticipants);
        } catch (err: any) {
            console.error("Ошибка при присоединении к комнате:", err.response?.data || err.message);
        }
    };

    const handleDisconnectRoom = async () => {
        if (socket && currentRoomId) {
            try {
                const consultationId = 26;
                await ConsultationService.leaveRoom(consultationId, Number(inputUserId)); // новый метод API
            } catch (err) {
                console.error("Ошибка при выходе из комнаты:", err);
            } finally {
                socket.disconnect();
                setConnected(false);
                setSocket(null);
                setCurrentRoomId(null);
            }
        }
    };


    return (
        <AccountLayout>
            <div className="page-container">
                <h1>Существующие комнаты</h1>

                <div>
                    <input
                        type="number"
                        placeholder="User ID"
                        value={inputUserId}
                        onChange={(e) => setInputUserId(Number(e.target.value))}
                        style={{ marginRight: "10px" }}
                    />
                    <select
                        value={inputUserRole}
                        onChange={(e) => setInputUserRole(e.target.value as "DOCTOR" | "PATIENT")}
                    >
                        <option value="DOCTOR">DOCTOR</option>
                        <option value="PATIENT">PATIENT</option>
                    </select>
                </div>

                <ul>
                    {rooms.map((room) => (
                        <li key={room.roomId} style={{ marginTop: "10px" }}>
                            <span>Room ID: {room.roomId}</span>
                            <button
                                style={{ marginLeft: "10px" }}
                                onClick={() => handleJoinRoom(room.roomId)}
                                disabled={connected && currentRoomId === room.roomId}
                            >
                                {connected && currentRoomId === room.roomId ? "Подключено" : "Присоединиться"}
                            </button>
                        </li>
                    ))}
                </ul>

                {connected && (
                    <div style={{ marginTop: "20px" }}>
                        <button onClick={handleDisconnectRoom}>Отключиться</button>
                        <h3>Участники комнаты {currentRoomId} ({participants.length}):</h3>
                        <ul>
                            {participants.map((p) => (
                                <li key={p.userId}>{p.userId} ({p.role})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </AccountLayout>
    );
};

export default AnotherProblem;
