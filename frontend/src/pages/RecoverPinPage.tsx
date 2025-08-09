import { Link, useParams } from 'react-router';
import { useContext } from 'react';
import { useState } from 'react';
import { Context } from '../main';
import { observer } from 'mobx-react-lite';
import logo from '../assets/images/logo.png'
import PinCodeInput from '../components/FormAuth/PinCodeInput/PinCodeInput';

const RecoverPin: React.FC = () => {
    let { token } = useParams();
    if (!token) token = "";

    const [pinCode, setPinCode] = useState<string>("");
    const [replyPinCode, setReplyPinCode] = useState<string>("");

    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const [step, setStep] = useState<number>(1);
    const { store } = useContext(Context);

    const RecoverPinCode = async () => {
        if (pinCode !== replyPinCode) {
            setError('Пин-коды не совпадают!');
            return;
        }

        const data = await store.resetPinCode(token, pinCode);
        if (data.success) {
            setMessage(data.message);
            setStep(2);
        } else {
            setError(data.message);
        }
    }

    return (
        step === 1 ? (
            <div className='reset-pin'>
                <div className='reset-pin__form'>
                    <div className="reset-pin__logo">
                        <img src={logo} />
                    </div>
                    <h3>Восстановление пин-кода</h3>
                    <div className='auth__form'>
                        <p style={{ textAlign: 'center' }}>Введите новый пин-код</p>
                        <PinCodeInput
                            onLogin={setPinCode}
                            countNumber={4}
                        />

                        <p style={{ textAlign: 'center' }}>Повторите новый пин-код</p>
                        <PinCodeInput
                            onLogin={setReplyPinCode}
                            countNumber={4}
                        />

                        <button onClick={RecoverPinCode} className='auth__button'>Изменить пин-код</button>
                        <Link to="/">
                            <button className='auth__button'>
                                Вернуться на главную страницу
                            </button>
                        </Link>

                        {error && <p className="auth__error">{error}</p>}
                    </div>
                </div>
            </div >
        ) : (
            <>
                <p>{message}</p>
                <Link to="/">
                    <button className='auth__button'>
                        Вернуться на главную страницу
                    </button>
                </Link>
            </>
        )
    )
}

export default observer(RecoverPin);