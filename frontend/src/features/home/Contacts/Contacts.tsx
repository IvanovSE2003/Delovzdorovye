import './Contacts.scss';
import vk from '../../../assets/images/vk.png'
import tg from '../../../assets/images/tg.png'
import AnimatedBlock from '../../../components/AnimatedBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { useCallback, useEffect, useState } from 'react';
import { processError } from '../../../helpers/processError';
import ShowError from '../../../components/UI/ShowError/ShowError';
import HomeService from '../../../services/HomeService';
import { GetFormatPhone } from '../../../helpers/formatDatePhone';
import LoaderUsefulInfo from '../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo';

const Contacts: React.FC<ElementHomePageProps> = ({ role }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    // Индификаторы для данных
    const [phoneId, setPhoneId] = useState<number | null>(null);
    const [emailId, setEmailId] = useState<number | null>(null);
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });
    const [loading, setLoading] = useState<boolean>(false);

    // Получение контактов
    const fetchContacts = async () => {
        try {
            setLoading(true);
            const phoneResponse = await HomeService.getContent("phone");
            setPhone(phoneResponse.data.contents[0].text || "Нет номера телефона");
            setPhoneId(phoneResponse.data.contents[0].id);

            const emailResponse = await HomeService.getContent("email");
            setEmail(emailResponse.data.contents[0].text || "Нет электронной почты");
            setEmailId(emailResponse.data.contents[0].id);
        } catch (e) {
            processError(e, "Ошибка при получении контактов");
        } finally {
            setLoading(false);
        }
    }

    // Добавление котактов в БД
    const addChange = async () => {
        try {
            setLoading(true);
            await HomeService.addContent('phone', { id: Date.now(), text: phone, });
            await HomeService.addContent('email', { id: Date.now(), text: email });
            fetchContacts();
            setMessage({ id: Date.now(), message: "Контакты успешно созданы в БД" });
        } catch (e) {
            processError(e, "Ошибка при сохдании контактов в БД", setError)
        } finally {
            setLoading(false);
        }
    }

    // Сохранение контакты
    const saveChange = async () => {
        if (!phoneId || !emailId) {
            await addChange();
            return;
        }

        try {
            setLoading(true);
            await HomeService.editContent('phone', { id: phoneId, text: phone });
            await HomeService.editContent('email', { id: emailId, text: email });
            setMessage({ id: Date.now(), message: "Контакты успешно сохранены" });
            setIsEditing(false);
        } catch (e) {
            processError(e, "Ошибка при сохранении контактов", setError);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchContacts();
    }, [])

    // Форматирование номера телефона
    const formatPhoneNumber = useCallback((inputValue: string): string => {
        let numbers = inputValue.replace(/\D/g, '');
        if (numbers.startsWith('7') || numbers.startsWith('8')) {
            numbers = numbers.substring(1);
        }

        let formattedValue = '+7';

        if (numbers.length > 0) {
            formattedValue += ' (' + numbers.substring(0, Math.min(3, numbers.length));
        }
        if (numbers.length > 3) {
            formattedValue += ') ' + numbers.substring(3, Math.min(6, numbers.length));
        }
        if (numbers.length > 6) {
            formattedValue += ' ' + numbers.substring(6, Math.min(8, numbers.length));
        }
        if (numbers.length > 8) {
            formattedValue += ' ' + numbers.substring(8, Math.min(10, numbers.length));
        }

        return formattedValue;
    }, []);

    // Обрабока ввода номера телефона
    const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        const input = e.target as HTMLInputElement;
        const formattedValue = formatPhoneNumber(input.value);
        setPhone(formattedValue);
    }, [formatPhoneNumber, setPhone]);

    if (loading) return (
        <AnimatedBlock>
            <div className="contacts" id="contacts">
                <div className='container__box'>
                    <h2 className='contacts__title'>Контакты</h2>
                    <LoaderUsefulInfo/>
                </div>
            </div>
        </AnimatedBlock>
    )

    return (
        <AnimatedBlock>
            <div className="contacts" id="contacts">
                <div className='container__box'>
                    <h2 className='contacts__title'>Контакты</h2>

                    <ShowError msg={error} />
                    <ShowError msg={message} mode='MESSAGE' />

                    <div className="contacts__info">
                        <p>Остались вопросы?</p>

                        {(!phone || !email) && !isEditing && (
                            <span>
                                Пока контактных данных нет
                            </span>
                        )}

                        {!isEditing ? (
                            <span>
                                <a href={`mailto:${email}`}>{email}</a><br />
                                <a href={`tel:${phone}`}>{GetFormatPhone(phone)}</a><br /><br />
                            </span>
                        ) : (
                            <>
                                <input
                                    className="contacts__info__edit"
                                    type="text"
                                    placeholder='Почта'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <input
                                    type="tel"
                                    name='phone-home'
                                    id='phone-home'
                                    autoComplete="billing mobile tel"
                                    value={phone}
                                    onInput={handleInput}
                                    className="contacts__info__edit"
                                    placeholder="+7 (___) ___ __ __"
                                    maxLength={18}
                                    title="Номер телефона"
                                />

                                <button
                                    className='my-button contacts__info__button'
                                    onClick={saveChange}
                                >
                                    Сохранить
                                </button>

                                <button
                                    className="neg-button contacts__info__button"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Отмена
                                </button>

                            </>
                        )}

                        {role === "ADMIN" && !isEditing && (
                            <button
                                className="my-button contacts__info__button"
                                onClick={() => setIsEditing(true)}
                            >
                                Редактировать
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