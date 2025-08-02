import React, { useState, useEffect } from "react";
import './Timer.scss';

const Timer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.getDate();
      const month = now.toLocaleString('ru-RU', { month: 'long' });
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // timezone получаем от сервера и записываем вместо МСК+02:00
      setCurrentTime(`${day} ${month}, ${hours}:${minutes} MCK+02:00`);
    };

    updateTime();
    const timerId = setInterval(updateTime, 60000);
    return () => clearInterval(timerId);
  }, []);

  return <div className="timer">{currentTime}</div>;
};

export default Timer;