import { useContext, useEffect, useState } from "react";
import "../FormAuth/FormAuth.scss";
import { Context } from "../../main";
import { motion, AnimatePresence } from "framer-motion";

import doctor from "../../assets/images/doctor.png"
import patient from "../../assets/images/patient.png"

import MyInput from "../UI/MyInput/MyInput";
import MySelect from "../UI/MySelect/MySelect";
import PinCodeInput from "./PinCodeInput/PinCodeInput";

import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import type { FormAuthProps, RegistrationData, Role, Gender } from "../../models/Auth";
import { RouteNames } from "../../routes";
import { TimeZoneLabels } from "../../models/TimeZones";

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
};

const Register: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState<RegistrationData>({} as RegistrationData); 
  const [step, setStep] = useState<number>(1); // Шаги регистрации
  const [replyPinCode, setReplyPinCode] = useState<string>(""); // Повтор пин-кода

  const [styleEmail, setStyleEmail] = useState<string>(""); // Стиль для ввода почты
  const [stylePhone, setStylePhone] = useState<string>(""); // стиль для ввода телефона
  const { store } = useContext(Context);

  // Стираю ошибку при изменении шага 
  useEffect(() => {
    setError("");
  }, [step])

  useEffect(() => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(userDetails.email)) {
      const checkAuth = async () => {
        const isAuth = await store.checkUser("", userDetails.email);
        if(isAuth.check) {
          setStyleEmail('invalid');
          setError('Пользователь с такой электронной почтой существует');
        } else {
          setStyleEmail('valid');
          setError("");
        }
      };
      checkAuth();
    } else {
      setStyleEmail("");
    }
  }, [userDetails.email])

  useEffect(() => {
  if (userDetails?.phone?.length === 11) { 
    const checkAuth = async () => {
      const isAuth = await store.checkUser(userDetails.phone, "");
      if (isAuth.check) {
        setStylePhone("invalid");
        setError("Пользователь с таким номером телефона существует");
      } else {
        setStylePhone("valid");
        setError("");
      }
    };
    checkAuth();
  } else {
    setStylePhone('');
  }
}, [userDetails?.phone]);

  // Завершение первого этапа 
  const next = (): void => {
    if(styleEmail == 'valid' && stylePhone == 'valid') {
      setStep(2);
      setError("");
    }
  }

  // Завершение оставшихся этапов
  const registration = (): void => {
    if (replyPinCode !== userDetails.pin_code) {
      setError("Пин-коды не совпадают!");
      return;
    }

    // Если пустое хоть одно поле объекта UserDetails
    if (Object.values(userDetails).some((value) => !value || value.trim() === "")) {
      setError("Все поля должны быть заполнены!");
      return;
    }

    setError("");
    store.registration(userDetails);
    if (store.isAuth) navigate(RouteNames.PERSONAL)
  };

  // Вернуться на предыдущий шаг
  const handleBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  // Добавить что-то к данным пользователя
  const handleDetailsChange = (
    field: keyof RegistrationData,
    value: string | Gender | Role
  ): void => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Измененить состояние пин-кода
  const SetPinCode = (pin: string) => handleDetailsChange('pin_code', pin);

  return (
    <div className="auth__container">

      <div className="auth__progress">
        <div
          className="auth__progress-bar"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.2 }}
            className="auth__form"
          >
            <MyInput
              id="surname"
              label="Фамилия"
              value={userDetails.surname}
              onChange={(value) => handleDetailsChange("surname", value)}
              required
            />

            <MyInput
              id="name"
              label="Имя"
              value={userDetails.name}
              onChange={(value) => handleDetailsChange("name", value)}
              required
            />

            <MyInput
              id="patronymic"
              label="Отчество"
              value={userDetails.patronymic}
              onChange={(value) => handleDetailsChange("patronymic", value)}
              required
            />

            <MyInput
              id="email"
              label="Электронная почта"
              value={userDetails.email}
              onChange={(value) => handleDetailsChange("email", value)}
              className={styleEmail}
              required
            />

            <MyInput
              id="phone"
              label="Телефон"
              value={userDetails.phone}
              maxLength={11}
              onChange={(value) => handleDetailsChange("phone", value)}
              className={stylePhone}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div className="auth__radio-btn">
                <input
                  id="male"
                  type="radio"
                  name="male"
                  value="мужчина"
                  checked={userDetails.gender === "мужчина"}
                  onChange={(e) => handleDetailsChange("gender", e.target.value)}
                />
                <label htmlFor="male">Мужчина</label>
              </div>

              <div className="auth__radio-btn">
                <input
                  id="female"
                  type="radio"
                  name="female"
                  value="женщина"
                  checked={userDetails.gender === "женщина"}
                  onChange={(e) => handleDetailsChange("gender", e.target.value)}
                />
                <label htmlFor="female">Женщина</label>
              </div>
            </div>

            <MyInput
              type="date"
              id="date_birth"
              label="Дата рождения"
              value={userDetails.date_birth}
              onChange={(value) => handleDetailsChange("date_birth", value)}
              required
            />

            <MySelect
              value={userDetails.time_zone}
              onChange={(value) => handleDetailsChange("time_zone", value)}
              label="Часовой пояс"
              defaultValue="-1"
              required
            >
              <option value="-1">Выбрать</option>
              {Object.entries(TimeZoneLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </MySelect>

            <button className="auth__button" onClick={next}>
              Продолжить
            </button>
            <a onClick={() => setState("login")} className="auth__toggle-button">
              Войти в аккаунт
            </a>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <div className="role-selection auth__form">
              <div className="role-selection__cards">
                <div
                  className="role-card role-card_doctor"
                  onClick={() => {
                    handleDetailsChange("role", "DOCTOR");
                    setStep(3);
                  }}
                >
                  <img className="role-card__icon" src={doctor} alt="doctor" />
                  <h3 className="role-card__title">Доктор</h3>
                  <p className="role-card__description">
                    Я медицинский специалист и хочу помогать пациентам
                  </p>
                </div>

                <div
                  className="role-card role-card_patient"
                  onClick={() => {
                    handleDetailsChange("role", "PACIENT");
                    setStep(3);
                  }}
                >
                  <img className="role-card__icon" src={patient} alt="patient" />
                  <h3 className="role-card__title">Пациент</h3>
                  <p className="role-card__description">
                    Я ищу медицинскую помощь или консультацию
                  </p>
                </div>
              </div>

              <button onClick={handleBack} className="auth__button">
                Назад
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <div className="auth__form">
              <h2>Придумайте пин-код</h2>
              <PinCodeInput
                onLogin={SetPinCode}
                countNumber={4}
              />

              <h2>Повторите пин-код</h2>
              <PinCodeInput
                onLogin={setReplyPinCode}
                countNumber={4}
              />

              <button onClick={registration} className="auth__button__final">
                Завершить регистрацию
              </button>

              <button type="button" onClick={handleBack} className="auth__button">
                Назад
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default observer(Register);