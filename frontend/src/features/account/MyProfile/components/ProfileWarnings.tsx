import { useContext, useEffect, useState } from "react";
import { Context } from "../../../../main";
import Loader from "../../../../components/UI/Loader/Loader";
import { observer } from "mobx-react-lite";

const ProfileWarnings: React.FC = () => {
    const { store } = useContext(Context);
    const [message, setMessage] = useState<string>("");

    // Получить сообщение 
    const getMessage = async () => {
        const data = await store.getTokenTg(store.user.id);
        setMessage(data.message);
    };

    if(store.loading) return <Loader/>

    return (
        <>
            
            <div className="user-profile__warns">
                {!store.user.isActivatedSMS && (
                    <div className="user-profile__error-block">
                        <span>
                            {message ? message : ""}<br/>
                            Для подлючения аккаунта к телеграмм-боту необходимо <a onClick={getMessage}>получить инструкцию на почту.</a> 
                        </span>
                    </div>
                )}

                {store.user.sentChanges && (
                    <div className="user-profile__warn-block">
                        <span>Ваши изменения находятся на модерации. Изменения принимаются или отклоняются администратором в течении нескольких часов.</span>
                    </div>
                )}
            </div>
        </>
    );
};

export default observer(ProfileWarnings);