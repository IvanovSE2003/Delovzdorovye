import { useContext, useState } from "react";
import { Context } from "../../../../main";
import QRcodeImg from '../../../../assets/images/qr_code.png'
import Loader from "../../../../components/UI/Loader/Loader";
import { observer } from "mobx-react-lite";

const ProfileWarnings: React.FC = () => {
    const { store } = useContext(Context);
    const [QRcode, setQRcode] = useState<boolean>(false);
    const [QRtoken, setQRtoken] = useState<string>("Тут должен быть токен");

    const onOpenQR = async () => {
        const data = await store.getTokenTg(store.user.id);
        if (data.success) {
            setQRtoken(data.token);
            setQRcode(true);
        } else {
            console.log("Error");
        }
    };

    if(store.loading) return <Loader/>

    return (
        <>
            <div className="user-profile__warns">
                {!store.user.isActivatedSMS && (
                    <div className="user-profile__error-block">
                        <span>
                            Вход доступен только по электронной почте. Код подтверждения приходит на почту, а не в Telegram. Если хотите использовать Telegram для входа, то можете 
                            <a onClick={onOpenQR}>
                                {' подключить номер телефона к боту.'}
                            </a>
                        </span>
                    </div>
                )}

                {store.user.sentChanges && (
                    <div className="user-profile__warn-block">
                        <span>Ваши изменения находятся на модерации. Изменения принимаются или отклоняются администратором в течении нескольких минут.</span>
                    </div>
                )}
            </div>
            {QRcode && (
                <div className="QRcode">
                    <div className="QRcode__box">
                        <img src={QRcodeImg} alt="QR-code tg" />
                        <p className="QRcode__token">{QRtoken}</p>
                        <p className="QRcode__description">Ваш токен для подключения</p>
                        <a className="QRcode__close" onClick={() => setQRcode(false)}>Скрыть</a>
                    </div>
                </div>
            )}
        </>
    );
};

export default observer(ProfileWarnings);