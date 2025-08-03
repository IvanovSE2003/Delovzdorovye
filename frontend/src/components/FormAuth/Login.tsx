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

type LoginProps = {
  setState: Dispatch<SetStateAction<AuthState>>;
};

const Login: React.FC<LoginProps> = ({ setState }) => {
  const navigate = useNavigate();
  const [isEmailAuth, setIsEmailAuth] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { store } = useContext(Context);

  const handleSubmitContact = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    // if (isEmailAuth) {
    //   const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);
    //   if (!emailValid) {
    //     setError("Введите корректный email");
    //     return;
    //   }
    // } else {
    //   const phoneValid = /^8\d{10}$/.test(phoneOrEmail);
    //   if (!phoneValid) {
    //     setError("Введите корректный номер телефона (8XXXXXXXXXX)");
    //     return;
    //   }
    // }

    const phoneValid = /^8\d{10}$/.test(phone);
    if (!phoneValid) {
      setError("Введите корректный номер телефона (8XXXXXXXXXX)");
      return;
    }

    setError("");
    await store.login({ phone, password });
    if(localStorage.getItem('token')) {
      navigate('/personal')
    }

  };

  const checkUser = async (phoneOrEmail: string) => {
    if (phoneOrEmail == "") return;
    if (!isEmailAuth) {
      const res = await store.checkUser(phoneOrEmail, null);
      res
        ? setError("Такой пользователь есть!")
        : setError("Такого пользователя нет!");
    } else {
      const res = await store.checkUser(null, phoneOrEmail);
      res
        ? setError("Такой пользователь есть!")
        : setError("Такого пользователя нет!");
    }
  };

  const toggleAuthType = (): void => {
    setIsEmailAuth((prev) => !prev);
    setPhone("");
    setError("");
  };

  return (
    <div>
      <form onSubmit={handleSubmitContact} className="auth__form">
        <div className="input-group">
          <input
            className="auth__input"
            type="tel"
            placeholder=" "
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            // onBlur={() => checkUser(phoneOrEmail)}
            required
          />
          <label htmlFor="repeat-password">
            Телефон
          </label>
        </div>

        <div className="input-group">
          <input
            type="password"
            className="auth__input"
            placeholder=" "
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <label htmlFor="repeat-password">Пароль</label>
        </div>

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
        <a onClick={() => setState("register")} className="auth__toggle-button">
          Зарегистрироваться
        </a>
      </form>
    </div>
  );
};

export default Login;
