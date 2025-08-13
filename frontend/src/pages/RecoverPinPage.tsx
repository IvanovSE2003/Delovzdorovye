import { Link, useNavigate, useParams } from 'react-router';
import { useContext } from 'react';
import { useState } from 'react';
import { Context } from '../main';
import { observer } from 'mobx-react-lite';
import logo from '../../public/logo.svg'
import PinCodeInput from '../components/FormAuth/PinCodeInput/PinCodeInput';
import { RouteNames } from '../routes';

const RecoverPin: React.FC = () => {
    let { token } = useParams();
    if (!token) token = "";

    const navigate = useNavigate();

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

        const data = await store.resetPinCode(pinCode, token);
        if (data.success) {
            setMessage(data.message);
            setStep(2);
        } else {
            setError(data.message);
        }
    }

    return (
        <div className='reset-pin'>
            <div className='reset-pin__form'>
                <div className="reset-pin__logo">
                    <img src={logo} />
                </div>
                <div className='auth__form'>
                    {step === 1 ? (
                        <>
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

                            <button
                                onClick={RecoverPinCode}
                                className='auth__button'
                            >
                                Изменить пин-код
                            </button>
                            <button
                                className='auth__button'
                                onClick={() => navigate(RouteNames.MAIN)}
                            >
                                Вернуться на главную страницу
                            </button>

                            {error && <p className="auth__error">{error}</p>}

                        </>
                    ) : (
                        <>
                            <p style={{textAlign: 'center', fontSize: '1.5rem'}}>{message}</p>
                            <button className='auth__button'>
                                <Link to={RouteNames.MAIN}>
                                    Вернуться на главную страницу
                                </Link>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div >
    )
}

export default observer(RecoverPin);