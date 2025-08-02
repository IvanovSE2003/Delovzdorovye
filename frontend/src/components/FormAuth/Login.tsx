import { useState, useContext, type FormEvent, type Dispatch, type SetStateAction} from 'react';
import { Context } from '../../main';
import type { AuthState } from './FormAuth';

type LoginProps = {
    setState: Dispatch<SetStateAction<AuthState>>;
};

const Login:React.FC<LoginProps>= ({ setState }) => {
    const [isEmailAuth, setIsEmailAuth] = useState<boolean>(false);
    const [phoneOrEmail, setPhoneOrEmail] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { store } = useContext(Context);

    const handleSubmitContact = async (e: FormEvent): Promise<void> => {
        e.preventDefault();

        if (isEmailAuth) {
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);
            if (!emailValid) {
                setError("Введите корректный email");
                return;
            }
        } else {
            const phoneValid = /^8\d{10}$/.test(phoneOrEmail);
            if (!phoneValid) {
                setError("Введите корректный номер телефона (8XXXXXXXXXX)");
                return;
            }
        }

        setError("");
    };

    const checkUser = async (phoneOrEmail: string) => {
        if (phoneOrEmail == "") return;
        if (!isEmailAuth) {
            const res = await store.checkUser(phoneOrEmail, null);
            res ? setError("Такой пользователь есть!") : setError("Такого пользователя нет!");
        } else {
            const res = await store.checkUser(null, phoneOrEmail);
            res ? setError("Такой пользователь есть!") : setError("Такого пользователя нет!");
        }
    };

    const toggleAuthType = (): void => {
        setIsEmailAuth((prev) => !prev);
        setPhoneOrEmail("");
        setError("");
    };

    return (
        <div>
            <form onSubmit={handleSubmitContact} className="auth__form">
                <input
                    className="auth__input"
                    type={isEmailAuth ? "email" : "tel"}
                    placeholder={isEmailAuth ? "Электронная почта" : "Телефон"}
                    value={phoneOrEmail}
                    onChange={async (e) => {
                        const val = isEmailAuth
                            ? e.target.value
                            : e.target.value.replace(/[^\d+]/g, "");
                        setPhoneOrEmail(val);
                    }}
                    onBlur={() => checkUser(phoneOrEmail)}
                    required
                />
                <input
                    type="password"
                    className="auth__input"
                    placeholder="Пароль"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />

                <button type="submit" className="auth__button">
                    Продолжить
                </button>

                <a
                    onClick={toggleAuthType}
                    className="auth__toggle-button"
                    role="button"
                >
                    {isEmailAuth ? "Войти по телефону" : "Войти по эл. почте"}
                </a>
                <a
                    onClick={() => setState("register")}
                    className="auth__toggle-button"
                >
                    Зарегистрироваться
                </a>
            </form>
        </div>
    )
}

export default Login;