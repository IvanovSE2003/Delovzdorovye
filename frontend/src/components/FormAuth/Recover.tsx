import { useState, type Dispatch, type SetStateAction, useContext } from "react";
import "./FormAuth.scss";
import type { AuthState } from "./FormAuth";
import { Context } from "../../main";

type LoginProps = {
    setState: Dispatch<SetStateAction<AuthState>>;
};

const Recover: React.FC<LoginProps> = ({ setState }) => {
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [step, setStep] = useState<number>(1);
    const { store } = useContext(Context)

    const recoverPassword = () => {
        setError("");
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValid) {
            setError("Введите корректный email");
            return;
        }

        console.log(store.resetPassword(email));
        setStep(2);
    }

    return (
        <div className="auth__form">
            {step === 1 && (
                <>
                    <h3>Восстановление пароля</h3>
                    <div className="input-group">
                        <input
                            className="auth__input"
                            type="email"
                            placeholder=" "
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="email"> Электронная почта </label>
                    </div>
                    {error && <p className="auth__error">{error}</p>}
                    <button
                        onClick={recoverPassword}
                        className="auth__button"
                    >
                        Продолжить
                    </button>
                    <p className="auth__toggle-button">
                        Вспомнили пароль?{" "}
                        <a onClick={() => setState("login")}>Войти</a>
                    </p>
                </>
            )}
            {step === 2 && (
                <div className="recover-success">
                    <h3>Проверьте вашу почту</h3>
                    <p>Мы отправили инструкции по восстановлению пароля на <strong>{email}</strong></p>
                    <button
                        onClick={() => setState("login")}
                        className="auth__button"
                    >
                        Вернуться к входу
                    </button>
                </div>
            )}
        </div>
    );
}

export default Recover;