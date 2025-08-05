import {
  useState,
  useContext,
  type FormEvent,
  useEffect,
} from "react";
import { useNavigate } from 'react-router';
import { Context } from "../../main";
import MyInput from "../UI/MyInput/MyInput";
import type { FormAuthProps } from "../../models/FormAuth";
import { observer } from "mobx-react-lite";
import PinCodeInput from "./PinCodeInput/PinCodeInput";
import { RouteNames } from "../../routes";

const Login: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const navigate = useNavigate();
  const [isEmailAuth, setIsEmailAuth] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const { store } = useContext(Context);

  useEffect(() => {
    setStep(1);
    setError(store.error);
  }, [store.error])

  const handleSubmitContact = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (isEmailAuth) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailValid) {
        setError("Введите корректный email");
        return;
      }
    } else {
      const phoneValid = /^8\d{10}$/.test(phone);
      if (!phoneValid) {
        setError("Введите корректный номер телефона (8XXXXXXXXXX)");
        return;
      }
    }

    setError("");
    setStep(2);
  };

  const toggleAuthType = (): void => {
    setIsEmailAuth((prev) => !prev);
    setPhone("");
    setEmail("");
    setError("");
  };

  const handleBack = () => {
    setError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const login = async (pin: string) => {
    setError("");
    console.log({ phone, email, password, pin_code: Number(pin) })
    await store.login({ phone, email, password, pin_code: Number(pin) });
    if (store.isAuth) navigate(RouteNames.PERSONAL);
  }

  return (
    <>
      {step === 1 && (
        <form onSubmit={handleSubmitContact} className="auth__form">
          {!isEmailAuth ? (
            <MyInput
              type="tel"
              id="phone"
              label="Телефон"
              value={phone}
              onChange={setPhone}
              maxLength={11}
              required
            />
          ) : (
            <MyInput
              type="email"
              id="emial"
              label="Электронная почта"
              value={email}
              onChange={setEmail}
              required
            />
          )}

          <MyInput
            type="password"
            id="password"
            label="Пароль"
            value={password}
            onChange={setPassword}
            required
          />

          <button type="submit" className="auth__button"> Продолжить </button>

          <a onClick={toggleAuthType} className="auth__toggle-button">
            {isEmailAuth ? "Войти по телефону" : "Войти по почте"}
          </a>
          <a onClick={() => setState("register")} className="auth__toggle-button">
            Зарегистрироваться
          </a>
          <a onClick={() => setState("recover")} className="auth__toggle-button">
            Забыл пароль
          </a>

        </form>
      )}

      {step === 2 && (
        <form className="auth__form">
          <PinCodeInput
            onLogin={login}
          />
          <button className="auth__button" onClick={handleBack}>
            Назад
          </button>
        </form>
      )}

    </>
  );
};

export default observer(Login);
