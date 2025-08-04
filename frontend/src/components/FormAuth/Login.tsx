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
    await store.login({ phone, password });
    if (store.isAuth) {
      navigate('/personal')
    }

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

  return (
    <div>
      {error && <p className="auth__error">{error}</p>}

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
    </div>
  );
};

export default Login;
