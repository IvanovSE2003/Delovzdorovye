import { Link, useParams } from 'react-router';
import { useContext } from 'react';
import { useState } from 'react';
import { Context } from '../main';
import { observer } from 'mobx-react-lite';
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className='auth__box'>
                    <h3>Восстановление пин-кода</h3>
                    <div className='auth__form'>
                        <PinCodeInput
                            onLogin={setPinCode}
                            countNumber={4}
                        />

                        <PinCodeInput
                            onLogin={setReplyPinCode}
                            countNumber={4}
                        />

                        <button onClick={RecoverPinCode} className='auth__button'>Изменить пин-код</button>

                        {error && <p className="auth__error">{error}</p>}
                    </div>
                </div>
            </div>
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