import { useContext, useState } from "react";
import { Context } from "../../../../main";
import Loader from "../../../../components/UI/Loader/Loader";
import { observer } from "mobx-react-lite";
import './ProfileWarnings.scss'

const ProfileWarnings: React.FC = () => {
    const { store } = useContext(Context);
    const [message, setMessage] = useState<string>("");

    // Получить сообщение 
    const getMessage = async () => {
        const data = await store.getTokenTg(store.user.id);
        setMessage(data.message);
    };

    if (store.loading) return <Loader />

    return (
        <>

            <div className="user-profile__warns">
                {!store.user.isActivatedSMS && (
                    <div className="user-profile__error-block">
                        {message
                            ? (
                                <div className="user-profile__message">{message}</div>
                            ) : (
                                <span>Для подключения аккаунта к Telegram-боту <a onClick={getMessage}>получите инструкцию</a>  по email.</span>
                            )
                        }
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