import { useEffect, useState, useRef } from "react";
import AdminService from "../services/AdminService";
import type { Role } from "../models/Auth";
import { processError } from "../helpers/processError";
import UserService from "../services/UserService";

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
        if (role === "ADMIN") {
          const response1 = await AdminService.getCountAdminData()
          const data = response1.data;

          setCountChange(data.countChange ?? 0);
          setCountConsult(data.countConsult ?? 0);
          setCountOtherProblem(data.countOtherProblem ?? 0);
        }

        if (role !== "ADMIN") {
          const response2 = await UserService.getNotifications(userId);
          setNotificationCount(response2.data.length);
        }
      } catch (e) {
        processError(e, "Ошибка при получении начальных данных");
      }
    };

    fetchInitialCounts();

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnection(true);
      ws.send(JSON.stringify({ type: "join", userId, role }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "notifications_count") {
        setNotificationCount(data.count);
      }

      if (data.type === "changes_count") {
        setCountChange(data.count);
      }

      if (data.type === "consult_count") {
        setCountConsult(data.count);
      }

      if(data.type === "otherProblem_count") {
        setCountOtherProblem(data.count);
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
