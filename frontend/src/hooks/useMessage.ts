import { useEffect, useState, useRef } from "react";
import AdminService from "../services/AdminService";
import type { Role } from "../models/Auth";

// interface NotificationData {
//   type: string;
//   payload: {
//     countChange?: number;
//     countConsult?: number;
//     countOtherProblem?: number;
//     notificationCount?: number;
//   };
// }

export const useMessage = (wsUrl: string, userId: number, role: Role) => {
  const [connection, setConnection] = useState<boolean>(false);
  const [countChange, setCountChange] = useState<number>(0);
  const [countConsult, setCountConsult] = useState<number>(0);
  const [countOtherProblem, setCountOtherProblem] = useState<number>(0);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchInitialCounts = async () => {
      try {
        const response = await AdminService.getCountAdminData()
        const data = response.data;

        setCountChange(data.countChange ?? 0);
        setCountConsult(data.countConsult ?? 0);
        setCountOtherProblem(data.countOtherProblem ?? 0);
      } catch (err) {
        console.error("Ошибка при получении начальных данных", err);
      }
    };

    fetchInitialCounts();

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnection(true);
      ws.send(JSON.stringify({ type: "join", userId, role}));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.type === "notification") {
        if (data.payload.countNotification !== undefined) setNotificationCount(data.payload.countNotification);
      }
    };

    ws.onclose = () => setConnection(false);
    ws.onerror = () => setConnection(false);

    return () => ws.close();
  }, [wsUrl, userId]);

  return {
    connection,
    countChange,
    countConsult,
    countOtherProblem,
    notificationCount,
  };
};
