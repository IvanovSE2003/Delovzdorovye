import './Contacts.scss';
import vk from '../../../assets/images/vk.png'
import tg from '../../../assets/images/tg.png'
import AnimatedBlock from '../../../components/AnimatedBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { useEffect, useState } from 'react';
import { processError } from '../../../helpers/processError';
import ShowError from '../../../components/UI/ShowError/ShowError';

const Contacts: React.FC<ElementHomePageProps> = ({ role }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const [error, setError] = useState<{id: number; message: string}>({id: 0, message: ""});
    const [message, setMessage] = useState<{id: number; message: string}>({id: 0, message: ""});

    const fetchContacts = () => {
        try {

        } catch (e) {
            processError(e, "Ошибка при получении контактов: ");
        }
    }

    useEffect(() => {
        fetchContacts();
    })

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

                        {isEditing ? (
                            <span>
                                <a href="mailto:ask@delovzdorovie.ru">ask@delovzdorovie.ru</a><br />
                                <a href="tel:88888888888">8 888 888 88 88</a><br/><br/>
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
                                    type="text"
                                    placeholder='Номер телефона'
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                /><br/><br/>
                            </span>
                        )}

                        {role === "ADMIN" && (
                            <button
                                className='my-button'
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "Редактировать" : "Выйти из редактирования"}
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