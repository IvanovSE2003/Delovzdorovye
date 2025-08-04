import {
  useState,
  useContext,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useNavigate } from 'react-router';
import { Context } from "../../main";
import type { AuthState } from "./FormAuth";
import MyInput from "../UI/MyInput/MyInput";

type LoginProps = {
  setState: Dispatch<SetStateAction<AuthState>>;
};

const Login: React.FC<LoginProps> = ({ setState }) => {
  const navigate = useNavigate();

  const [isEmailAuth, setIsEmailAuth] = useState<boolean>(false);

  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pinCode, setPinCode] = useState<string>("");

  const [step, setStep] = useState<number>(2);


  const [error, setError] = useState<string>("");
  const { store } = useContext(Context);

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

  const checkUser = async (phone: string, email: string) => {
    if (phone == "" || email == "") return;
    const res = await store.checkUser(phone, email);
    res
      ? setError("Такой пользователь есть!")
      : setError("Такого пользователя нет!");
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

  const login = (e: FormEvent) => {
    e.preventDefault();
    // const pinCodeValid = /^d{4}$/.test(pinCode);
    // if (!pinCodeValid) {
    //   setError("Введите корректный пин-код");
    //   return;
    // }
    setError("");
    store.login({phone, email, password, pin_code: Number(pinCode)});
    if(store.isAuth) navigate('/personal');
  }

  return (
    <>
      {error && <p className="auth__error">{error}</p>}

      {step === 1 && (
        <form onSubmit={handleSubmitContact} className="auth__form">
          {!isEmailAuth ? (
            <MyInput
              type="tel"
              id="phone"
              label="Телефон"
              value={phone}
              onChange={setPhone}
              onBlur={() => checkUser(phone, email)}
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
              onBlur={() => checkUser(phone, email)}
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
        <form onSubmit={login} className="auth__form">
          <MyInput
            id="pin-code"
            label="Пин-код"
            value={pinCode}
            onChange={(value) => setPinCode(value)}
            maxLength={4}
            required
          />

          <button type="submit" className="auth__button">
            Войти
          </button>

          <button className="auth__button" onClick={handleBack}>
            Назад
          </button>
        </form>
      )}

    </>
  );
};

export default Login;
