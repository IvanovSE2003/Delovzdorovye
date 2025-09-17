import './Contacts.scss';
import vk from '../../../assets/images/vk.png'
import tg from '../../../assets/images/tg.png'
import AnimatedBlock from '../../../components/AnimatedBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { useEffect, useState } from 'react';
import { processError } from '../../../helpers/processError';
import ShowError from '../../../components/UI/ShowError/ShowError';
import HomeService from '../../../services/HomeService';
import { GetFormatPhone } from '../../../helpers/formatDatePhone';

const Contacts: React.FC<ElementHomePageProps> = ({ role }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    // Индификаторы для данных
    const [phoneId, setPhoneId] = useState<number|null>(null);
    const [emailId, setEmailId] = useState<number|null>(null);

    // Сообщения
    const [error, setError] = useState<{id: number; message: string}>({id: 0, message: ""});
    const [message, setMessage] = useState<{id: number; message: string}>({id: 0, message: ""});

    // Получение данных
    const fetchContacts = async () => {
        try {
            const phoneResponse = await HomeService.getContent("phone");
            setPhone(phoneResponse.data[0].header || "Нет номера телефона");
            setPhoneId(phoneResponse.data[0].id);

            const emailResponse = await HomeService.getContent("email");
            setEmail(emailResponse.data[0].header || "Нет электронной почты");
            setEmailId(emailResponse.data[0].id);
        } catch (e) {
            processError(e, "Ошибка при получении контактов", setError);
        }
    }

    // Сохранить 
    const saveChange = async () => {
        if(!phoneId || !emailId) return;
        try {
            await HomeService.editContent('phone', {id: phoneId, header: phone, text: "-"});
            await HomeService.editContent('email', {id: emailId, header: email, text: "-"});
            setMessage({id: Date.now(), message: "Контакты успешно сохранены"});
        } catch (e) {
            processError(e, "Ошибка при сохранении контактов", setError);
        } finally {
            setIsEditing(false);
        }
    }

    // Получение данных загрузке блока
    useEffect(() => {
        fetchContacts();
    }, [])

    return (
        <AnimatedBlock>
            <div className="contacts" id="contacts">
                <div className='container__box'>
                    <h2 className='contacts__title'>Контакты</h2>

                    <ShowError
                        msg={error}
                    />

                    <ShowError
                        msg={message}
                        mode='MESSAGE'
                    />

                    <div className="contacts__info">
                        <p>Остались вопросы?</p>

                        {!isEditing ? (
                            <span>
                                <a href={`mailto:${email}`}>{email}</a><br />
                                <a href={`tel:${phone}`}>{GetFormatPhone(phone)}</a><br/><br/>
                            </span>
                        ) : (
                            <span>
                                <input
                                    className="contacts__info__edit"
                                    type="text"
                                    placeholder='Почта'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                /><br />
                                <input
                                    className="contacts__info__edit"
                                    type="tel"
                                    minLength={11}
                                    placeholder='Номер телефона'
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                /><br/>
                                <button
                                    className='my-button contacts__info__button'
                                    onClick={saveChange}
                                >
                                    Сохранить
                                </button><br/><br/>

                            </span>
                        )}

                        {role === "ADMIN" && (
                            <button
                                className={`${!isEditing ? "my-button" : "neg-button"}`}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {!isEditing ? "Редактировать" : "Выйти из редактирования"}
                            </button>
                        )}

                        <div className="contacts__socials">
                            <p>Социальные сети</p>
                            <div className="contacts__socials__icons">
                                <img src={vk} />
                                <img src={tg} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedBlock>
    )
}

export default Contacts;