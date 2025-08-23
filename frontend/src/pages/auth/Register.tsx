import { useContext, useEffect, useState } from "react";
import "./FormAuth/FormAuth.scss";
import { Context } from "../../main";
import { motion, AnimatePresence } from "framer-motion";
import Select from 'react-select';

import doctor from "../../assets/images/doctor.png"
import patient from "../../assets/images/patient.png"

import MyInput from "../../components/UI/MyInput/MyInput";
import MySelect from "../../components/UI/MySelect/MySelect";
import PinCodeInput from "../../components/UI/PinCodeInput/PinCodeInput";
import CheckBox from "../../components/UI/CheckBox/CheckBox";

import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import type { FormAuthProps, RegistrationData, Role, Gender } from "../../models/Auth";
import { RouteNames } from "../../routes";
import { TimeZoneLabels } from "../../models/TimeZones";
import $api, { API_URL } from "../../http";
import Loader from "../../components/UI/Loader/Loader";

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
};

interface SelectOption {
  value: number;
  label: string;
}

const Register: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const navigate = useNavigate();

  const [disabled, setDisable] = useState<boolean>(true);
  const [userDetails, setUserDetails] = useState<RegistrationData>({} as RegistrationData);
  const [step, setStep] = useState<number>(1); // Шаги регистрации
  const [replyPinCode, setReplyPinCode] = useState<string>(""); // Повторный пин-код
  const [anonym, setAnonym] = useState<boolean>(false); // Анонимный пользователь
  const [options, setOptions] = useState<SelectOption[]>([]); // Специализации для селекта

  const [specializations, setSpecializations] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>();
  const [diploma, setDiploma] = useState<File>();
  const [license, setLicense] = useState<File>();

  const [styleEmail, setStyleEmail] = useState<string>(""); // Стиль для ввода почты
  const [stylePhone, setStylePhone] = useState<string>(""); // стиль для ввода телефона
  const { store } = useContext(Context);

  // Стираю ошибку при изменении шага 
  useEffect(() => {
    setError("");
    if (step === 3) {
      $api.get(`${API_URL}/specialization/all`)
        .then(response => {
          const formattedOptions = response.data.map((opt: { id: number; name: string }) => ({
            value: opt.id,
            label: opt.name
          }));
          setOptions(formattedOptions);
        })
        .catch(error => {
          if (error.response) {
            console.error('Ошибка сервера:', error.response.status);
            setError("Ошибка при получении специализаций!");
          }
        });
    }
  }, [step])

  // Проверка на сущ. пользователя по почте
  useEffect(() => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(userDetails.email)) {
      const checkAuth = async () => {
        const isAuth = await store.checkUser(userDetails.email);
        if (isAuth.success) {
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

  // Проверка на сущ. пользвоателя по телефону
  useEffect(() => {
    if (userDetails?.phone?.length === 11) {
      const checkAuth = async () => {
        const isAuth = await store.checkUser(userDetails.phone);
        if (isAuth.success) {
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


  // Проверка что введены все обязательные поля
  const checkAllData = () => {
    if (anonym) {
      return userDetails.email && userDetails.phone
        && userDetails.gender && userDetails.date_birth
        && userDetails.time_zone;
    } else {
      return userDetails.email && userDetails.phone
        && userDetails.gender && userDetails.date_birth
        && userDetails.time_zone && userDetails.name
        && userDetails.surname && userDetails.patronymic;
    }
  }

  // Завершение первого этапа 
  const handleStep1 = (): void => {
    if (styleEmail == 'valid' && stylePhone == 'valid') {
      if (checkAllData()) {
        setStep(2);
        setError("");
      } else {
        setError("Заполните все обязательные поля!")
        return;
      }
    }
  }

  // Завершение третьего этапа
  const handleStep3 = () => {
    setStep(4);
  }

  // Завершение четвертого этапов
  const registration = (): void => {
    if (replyPinCode !== userDetails.pin_code) {
      setError("Пин-коды не совпадают!");
      return;
    }

    if (userDetails.role === 'DOCTOR') {
      setUserDetails((prev) => ({
        ...prev,
        specializations,
        experienceYears,
        diploma,
        license
      }));
    }

    setError("");
    console.log(userDetails)
    // store.registration(userDetails);
    // if (store.isAuth) navigate(RouteNames.PERSONAL)
  };

  const handleBack = () => {
    setError("");
    if (step > 1) {
      if (userDetails.role === "PATIENT" && step === 4) setStep(step - 2);
      else setStep(step - 1);
    }
  };

  // Добавить что-то к данным пользователя
  const handleUserDetailsChange = (field: keyof RegistrationData, value: string | boolean | Gender | Role): void => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Измененить состояние пин-кода
  const SetPinCode = (pin: string) => handleUserDetailsChange('pin_code', pin);

  const handleAgreementChange = (isChecked: boolean) => {
    console.log('Пользователь нажал на галочку:', isChecked);
    setDisable(!isChecked);
  };

  const handleLinkClick = () => {
    console.log('Нажатие на ссылку');
  };

  const anonymSet = (value: boolean) => {
    setAnonym(value);
    handleUserDetailsChange("isAnonymous", value);
  }

  if(store.loading) return <Loader/>

  return (
    <div className="auth__container">

      <div className="auth__progress">
        <div
          className="auth__progress-bar"
          style={{ width: `${(step / 4) * 100}%` }}
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
            <div className="anonym-block">
              <input
                type="checkbox"
                name="anonym"
                value="anonym"
                defaultChecked={anonym}
                onClick={e => anonymSet(e.target.checked)}
              />
              <span>Анонимная регистрация</span>
            </div>

            {!anonym && (
              <>
                <MyInput
                  id="surname"
                  label="Фамилия"
                  value={userDetails.surname}
                  onChange={(value) => handleUserDetailsChange("surname", value)}
                  required
                />

                <MyInput
                  id="name"
                  label="Имя"
                  value={userDetails.name}
                  onChange={(value) => handleUserDetailsChange("name", value)}
                  required
                />

                <MyInput
                  id="patronymic"
                  label="Отчество"
                  value={userDetails.patronymic}
                  onChange={(value) => handleUserDetailsChange("patronymic", value)}
                  required
                />
              </>
            )}

            <MyInput
              id="email"
              label="Электронная почта"
              value={userDetails.email}
              onChange={(value) => handleUserDetailsChange("email", value)}
              className={styleEmail}
              required
            />

            <MyInput
              id="phone"
              label="Телефон"
              value={userDetails.phone}
              maxLength={11}
              onChange={(value) => handleUserDetailsChange("phone", value)}
              className={stylePhone}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div className="auth__radio-btn">
                <input
                  id="male"
                  type="radio"
                  name="male"
                  value="Мужчина"
                  checked={userDetails.gender === "Мужчина"}
                  onChange={(e) => handleUserDetailsChange("gender", e.target.value)}
                />
                <label htmlFor="male">Мужчина</label>
              </div>

              <div className="auth__radio-btn">
                <input
                  id="female"
                  type="radio"
                  name="female"
                  value="Женщина"
                  checked={userDetails.gender === "Женщина"}
                  onChange={(e) => handleUserDetailsChange("gender", e.target.value)}
                />
                <label htmlFor="female">Женщина</label>
              </div>
            </div>

            <MyInput
              type="date"
              id="date_birth"
              label="Дата рождения"
              value={userDetails.date_birth}
              onChange={(value) => handleUserDetailsChange("date_birth", value)}
              required
            />

            <MySelect
              value={userDetails.time_zone}
              onChange={(value) => handleUserDetailsChange("time_zone", value)}
              label="Часовой пояс"
              defaultValue=""
              required
            >
              <option value="">Выбрать</option>
              {Object.entries(TimeZoneLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </MySelect>

            <button className="auth__button" onClick={handleStep1}>
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
                {anonym
                  ?
                  <div
                    className="role-card role-card__blocked"
                  >
                    <img className="role-card__icon" src={doctor} alt="doctor" />
                    <h3 className="role-card__title">Доктор</h3>
                    <p className="role-card__description">
                      Доктор не может быть анонимным пользователем
                    </p>
                  </div>
                  :
                  <div
                    className="role-card role-card_doctor"
                    onClick={() => {
                      handleUserDetailsChange("role", "DOCTOR");
                      setStep(3);
                    }}
                  >
                    <img className="role-card__icon" src={doctor} alt="doctor" />
                    <h3 className="role-card__title">Доктор</h3>
                    <p className="role-card__description">
                      Я медицинский специалист и хочу помогать пациентам
                    </p>
                  </div>
                }

                <div
                  className="role-card role-card_patient"
                  onClick={() => {
                    handleUserDetailsChange("role", "PATIENT");
                    setStep(4);
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
            className="auth__form"
          >

            <Select
              isMulti
              options={options}
              placeholder="Специализации"
              onChange={(selected) => setSpecializations(selected.map((s: SelectOption) => s.label))}
              className="auth__specializations"
              classNamePrefix="react-select"
              noOptionsMessage={() => "Специализации не найдены"}
              loadingMessage={() => "Загрузка..."}
              id="specializations"
            />

            <MyInput
              id="experienceYears"
              label="Опыт работы"
              type="number"
              value={experienceYears?.toString()}
              onChange={(value) => setExperienceYears(Number(value))}
              required
            />

            <MyInput
              id="diploma"
              type="file"
              accept=".pdf"
              label="Диплом"
              onChange={(file) => setDiploma(file)}
              required
            />

            <MyInput
              id="license"
              type="file"
              accept=".pdf"
              label="Лицензия"
              onChange={(file) => setLicense(file)}
              required
            />

            <button
              className="auth__button"
              onClick={handleStep3}
            >
              Продолжить
            </button>

            <button
              className="auth__button"
              onClick={handleBack}
            >
              Назад
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
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

              <CheckBox
                onAgreementChange={handleAgreementChange}
                onLinkClick={handleLinkClick}
              />

              <button onClick={registration} className="auth__button__final" disabled={disabled}>
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