import React, {
  useContext,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import "../FormAuth/FormAuth.scss";
import { Context } from "../../main";
import type { AuthState } from "./FormAuth";

type Gender = "мужчина" | "женщина" | "";
type Role = "PACIENT" | "DOCTOR" | "ADMIN" | "";
interface UserDetails {
  name: string;
  surname: string;
  patronymic: string;
  email: string;
  phone: string;
  pin_code: string;
  password: string;
  time_zone: string;
  date_birth: string;
  gender: Gender;
  role: Role;
}

type RegisterProps = {
  setState: Dispatch<SetStateAction<AuthState>>;
};

const Register: React.FC<RegisterProps> = ({ setState }) => {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    surname: "",
    patronymic: "",
    email: "",
    phone: "",
    pin_code: "",
    password: "",
    time_zone: "",
    date_birth: "",
    gender: "",
    role: "",
  });
  const [error, setError] = useState<string>("");
  const [replyPass, setReplyPass] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const { store } = useContext(Context);

  const handleSubmitDetails = (e: FormEvent): void => {
    e.preventDefault();

    if (replyPass !== userDetails.password) {
      setError("Пароли не совпадают!");
      return;
    }

    const isEmpty = Object.values(userDetails).some(
      (value) => !value || value.trim() === ""
    );
    if (isEmpty) {
      setError("Все поля должны быть заполнены!");
      return;
    }

    setError("");
    store.registration(userDetails);

    if (localStorage.getItem("token")) {
      window.location.href = "/personal";
    }

    console.log("Регистрируем пользователя:", userDetails);
  };

  const handleBack = () => {
    setError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleDetailsChange = (
    field: keyof UserDetails,
    value: string | Gender | Role
  ): void => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {step === 1 && (
        <div className="auth__form">
          {error && <p className="auth__error">{error}</p>}

          <div className="auth__input-group">
            <input
              type="text"
              placeholder=" "
              className="auth__input"
              value={userDetails.surname}
              onChange={(e) => handleDetailsChange("surname", e.target.value)}
              required
            />
            <label htmlFor="repeat-password">Фамилия</label>
          </div>

          <div className="auth__input-group">
            <input
              type="text"
              placeholder=" "
              className="auth__input"
              value={userDetails.name}
              onChange={(e) => handleDetailsChange("name", e.target.value)}
              required
            />
            <label htmlFor="repeat-password">Имя</label>
          </div>

          <div className="auth__input-group">
            <input
              type="text"
              placeholder=" "
              className="auth__input"
              value={userDetails.patronymic}
              onChange={(e) =>
                handleDetailsChange("patronymic", e.target.value)
              }
            />
            <label htmlFor="repeat-password">Отчество</label>
          </div>

          <div className="auth__input-group">
            <input
              type="text"
              placeholder=" "
              className="auth__input"
              value={userDetails.email}
              onChange={(e) => handleDetailsChange("email", e.target.value)}
              required
            />
            <label htmlFor="repeat-password">Электронная почта</label>
          </div>

          <div className="auth__input-group">
            <input
              type="text"
              placeholder=" "
              className="auth__input"
              value={userDetails.phone}
              maxLength={11}
              onChange={(e) =>
                handleDetailsChange(
                  "phone",
                  e.target.value.replace(/[^\d+]/g, "")
                )
              }
              required
            />
            <label htmlFor="repeat-password">Телефон</label>
          </div>

          <div className="auth__radios-group">
            <div className="form_radio_btn">
              <input
                id="radio-1"
                type="radio"
                name="radio"
                value="мужчина"
                checked={userDetails.gender === "мужчина"}
                onChange={(e) => handleDetailsChange("gender", e.target.value)}
              />
              <label htmlFor="radio-1">Мужчина</label>
            </div>

            <div className="form_radio_btn">
              <input
                id="radio-2"
                type="radio"
                name="radio"
                value="женщина"
                checked={userDetails.gender === "женщина"}
                onChange={(e) => handleDetailsChange("gender", e.target.value)}
              />
              <label htmlFor="radio-2">Женщина</label>
            </div>
          </div>

          <div className="auth__input-group">
            <input
              type="date"
              className="auth__input"
              value={userDetails.date_birth}
              onChange={(e) =>
                handleDetailsChange("date_birth", e.target.value)
              }
              required
            />
            <label>Дата рождения</label>
          </div>

          <div className="auth__input-group">
            <select
              value={userDetails.time_zone}
              onChange={(e) => handleDetailsChange("time_zone", e.target.value)}
              className="auth__input"
              required
            >
              <option value="">Выбрать</option>
              <option value="0">-1 МСК</option>
              <option value="1">МСК</option>
              <option value="2">+1 МСК</option>
              <option value="3">+2 МСК</option>
              <option value="4">+3 МСК</option>
              <option value="5">+4 МСК</option>
              <option value="6">+5 МСК</option>
              <option value="7">+6 МСК</option>
              <option value="8">+7 МСК</option>
              <option value="9">+8 МСК</option>
              <option value="10">+9 МСК</option>
            </select>
            <label>Часовой пояс</label>
          </div>

          <button className="auth__button" onClick={() => setStep(2)}>
            Продолжить
          </button>
          <a onClick={() => setState("login")} className="auth__toggle-button">
            Войти в аккаунт
          </a>
        </div>
      )}

      {step === 2 && (
        <div className="role-selection auth__form">
          {error && <p className="auth__error">{error}</p>}

          <div className="role-selection__cards">
            <div className="role-card role-card_doctor">
              <div className="role-card__icon">👨‍⚕️</div>
              <h3 className="role-card__title">Доктор</h3>
              <p className="role-card__description">
                Я медицинский специалист и хочу помогать пациентам
              </p>
              <button
                className="role-card__button"
                onClick={() => {
                  handleDetailsChange("role", "DOCTOR");
                  setStep(3);
                }}
              >
                Выбрать
              </button>
            </div>

            <div className="role-card role-card_patient">
              <div className="role-card__icon">👤</div>
              <h3 className="role-card__title">Пациент</h3>
              <p className="role-card__description">
                Я ищу медицинскую помощь или консультацию
              </p>
              <button
                className="role-card__button"
                onClick={() => {
                  handleDetailsChange("role", "PACIENT");
                  setStep(3);
                }}
              >
                Выбрать
              </button>
            </div>
          </div>
          <button onClick={handleBack} className="auth__button">
            Назад
          </button>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmitDetails} className="auth__form">
          <h3 className="role-selection__title">Придумайте пин-код и пароль</h3>

          {error && <p className="auth__error">{error}</p>}

          <div className="auth__input-group">
            <input
              type="text"
              placeholder=" "
              className="auth__input"
              maxLength={4}
              onChange={(e) =>
                handleDetailsChange(
                  "pin_code",
                  e.target.value.replace(/[^\d+]/g, "")
                )
              }
              value={userDetails.pin_code}
            />
            <label htmlFor="repeat-password">Пин-код</label>
          </div>

          <div className="auth__input-group">
            <input
              type="password"
              placeholder=" "
              className="auth__input"
              onChange={(e) => handleDetailsChange("password", e.target.value)}
              value={userDetails.password}
            />
            <label htmlFor="repeat-password">Пароль</label>
          </div>

          <div className="auth__input-group">
            <input
              type="password"
              id="repeat-password"
              placeholder=" "
              className="auth__input"
              onChange={(e) => setReplyPass(e.target.value)}
              value={replyPass}
            />
            <label htmlFor="repeat-password">Повторите пароль</label>
          </div>

          <button type="submit" className="auth__button__final">
            Завершить регистрацию
          </button>

          <button type="button" onClick={handleBack} className="auth__button">
            Назад
          </button>
        </form>
      )}
    </>
  );
};

export default Register;
