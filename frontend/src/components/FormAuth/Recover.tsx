import { useState, useContext } from "react";
import "./FormAuth.scss";
import { Context } from "../../main";
import MyInput from "../UI/MyInput/MyInput";
import type { FormAuthProps } from "../../models/Auth";

const Recover: React.FC<FormAuthProps> = ({ setState, setError }) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [step, setStep] = useState(1);
    const { store } = useContext(Context);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const resetPinCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(email)) {
            setError("Введите корректный email");
            return;
        }

        try {
            const data = await store.sendEmailResetPinCode(email);
            setMessage(data.message);

            data.success ? setStep(2) : setError(data.message || "Произошла ошибка при восстановлении пароля");
        } catch (err) {
            setError("Произошла непредвиденная ошибка");
            console.error("Ошибка:", err);
        }
    };

    return (
        <>
            {step === 1 ? (
                <div className="auth__form">
                    <h3>Восстановление пин-кода</h3>

                    <MyInput
                        type="email"
                        id="recover-email"
                        label="Электронная почта"
                        value={email}
                        onChange={(value: string) => setEmail(value.trim())}
                        required
                    />

                    <button onClick={resetPinCode} className="auth__button">
                        Продолжить
                    </button>

                    <a onClick={() => setState("login")} className="auth__toggle-button">
                        Войти в систему
                    </a>
                </div>
            ) : (
                <div className="recover-success">
                    <h3>Проверьте вашу почту</h3>
                    <p>{message}</p>
                    <button
                        onClick={() => setState("login")}
                        className="auth__button"
                    >
                        Вернуться к входу
                    </button>
                </div>
            )}
        </>
    );
};

export default Recover;