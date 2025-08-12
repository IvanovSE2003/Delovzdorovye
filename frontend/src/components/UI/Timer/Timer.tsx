import React, { useState, useEffect, useContext } from "react";
import './Timer.scss';
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import { getTimeZoneLabel } from "../../../models/TimeZones";

const Timer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const { store } = useContext(Context);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.getDate();
      const month = now.toLocaleString('ru-RU', { month: 'long' });
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      store.isAuth
        ? setCurrentTime(`${day} ${month}, ${hours}:${minutes} ${getTimeZoneLabel(store.user.timeZone)}`)
        : setCurrentTime('Пользователь не авторизирован!');
    };

    updateTime();
    const timerId = setInterval(updateTime, 60000);
    return () => clearInterval(timerId);
  }, []);

  return <div className="timer">{currentTime}</div>;
};

export default observer(Timer);