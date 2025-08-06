import React, { useContext, useState } from "react";
import "../FormAuth/FormAuth.scss";
import { Context } from "../../main";

import doctor from "../../assets/images/doctor.png"
import patient from "../../assets/images/patient.png"

import MyInput from "../UI/MyInput/MyInput";
import MySelect from "../UI/MySelect/MySelect";
import PinCodeInput from "./PinCodeInput/PinCodeInput";
import { observer } from "mobx-react-lite";

import type { FormAuthProps } from "../../models/Auth";
import { useNavigate } from "react-router";
import type { RegistrationData, Role, Gender } from "../../models/Auth";
import { RouteNames } from "../../routes";

const Register: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState<RegistrationData>({
    name: "",
    surname: "",
    patronymic: "",
    email: "",
    phone: "",
    pin_code: "",
    time_zone: "",
    date_birth: "",
    gender: "",
    role: ""
  });
  const [step, setStep] = useState<number>(1);
  const { store } = useContext(Context);

  // Завершение всех трех этапов
  const registration = (): void => {
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

  // Изменить элемент 
  const handleDetailsChange = (
    field: keyof RegistrationData,
    value: string | Gender | Role
  ): void => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Измененить состояние пин-кода
  const SetPinCode = (pin: string) => handleDetailsChange('pin_code', pin);

  return (
    <>
      {step === 1 && (
        <div className="auth__form">
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
            required
          />

          <MyInput
            id="phone"
            label="Телефон"
            value={userDetails.phone}
            maxLength={11}
            onChange={(value) => handleDetailsChange("phone", value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
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
          </MySelect>

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
      )}

      {step === 3 && (
        <div className="auth__form">
          <h2>Придумайте пин-код</h2>

          <PinCodeInput
            onLogin={SetPinCode}
            countNumber={4}
          />

          <button onClick={registration} className="auth__button__final">
            Завершить регистрацию
          </button>

          <button type="button" onClick={handleBack} className="auth__button">
            Назад
          </button>
        </div>
      )}
    </>
  );
};

export default observer(Register);
