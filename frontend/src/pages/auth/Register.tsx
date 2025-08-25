import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import "./FormAuth/FormAuth.scss";
import { Context } from "../../main";
import { motion, AnimatePresence } from "framer-motion";
// import Select from 'react-select';

import MyInput from "../../components/UI/MyInput/MyInput";
// import MySelect from "../../components/UI/MySelect/MySelect";
import PinCodeInput from "../../components/UI/PinCodeInput/PinCodeInput";
import CheckBox from "../../components/UI/CheckBox/CheckBox";

import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import type { FormAuthProps, RegistrationData, Role, Gender } from "../../models/Auth";
import { RouteNames } from "../../routes";
import { ITimeZones, TimeZoneLabels } from "../../models/TimeZones";
// import $api, { API_URL } from "../../http";
import Loader from "../../components/UI/Loader/Loader";
import MyInputTel from "../../components/UI/MyInput/MyInputTel";
import MyInputDate from "../../components/UI/MyInput/MyInputDate";
import MyInputEmail from "../../components/UI/MyInput/MyInputEmail";
import MySelect from "../../components/UI/MySelect/MySelect";

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
};

// interface SelectOption {
//   value: number;
//   label: string;
// }

const Register: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const navigate = useNavigate();
  const { store } = useContext(Context);

  const [disabled, setDisabled] = useState<boolean>(true);
  const [userDetails, setUserDetails] = useState<RegistrationData>({} as RegistrationData);
  const [step, setStep] = useState<number>(1);
  const [replyPinCode, setReplyPinCode] = useState<string>("");
  const [anonym, setAnonym] = useState<boolean>(false);
  // const [options, setOptions] = useState<SelectOption[]>([]);
  const [styleEmail, setStyleEmail] = useState<string>("");
  const [stylePhone, setStylePhone] = useState<string>("");

  // Стираю ошибку при изменении шага 
  useEffect(() => {
    setError("");
  }, [step, setError]);

  // Проверка на существование пользователя по почте
  useEffect(() => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(userDetails.email || "")) {
      const checkAuth = async () => {
        try {
          const isAuth = await store.checkUser(userDetails.email);
          if (isAuth.success) {
            setStyleEmail('invalid');
            setError('Пользователь с такой электронной почтой существует');
          } else {
            setStyleEmail('valid');
            setError("");
          }
        } catch (error) {
          console.error('Ошибка проверки email:', error);
          setStyleEmail("");
        }
      };
      checkAuth();
    } else {
      setStyleEmail("");
    }
  }, [userDetails.email, setError, store]);

  // Проверка на существование пользователя по телефону
  useEffect(() => {
    if (userDetails?.phone?.length === 18) {
      const checkAuth = async () => {
        try {
          const isAuth = await store.checkUser(userDetails.phone);
          if (isAuth.success) {
            setStylePhone("invalid");
            setError("Пользователь с таким номером телефона существует");
          } else {
            setStylePhone("valid");
            setError("");
          }
        } catch (error) {
          console.error('Ошибка проверки телефона:', error);
          setStylePhone("");
        }
      };
      checkAuth();
    } else {
      setStylePhone('');
    }
  }, [userDetails?.phone, setError, store]);

  const calculateAge = useCallback((birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }, []);

  const detectUserTimeZone = useCallback(async (): Promise<ITimeZones> => {
    try {
      const now = new Date();
      const utcOffset = -now.getTimezoneOffset() / 60;
      return getRussianTimeZoneByOffset(utcOffset);
    } catch (error) {
      console.error('Ошибка определения часового пояса:', error);
      return ITimeZones.MOSCOW;
    }
  }, []);

  const getRussianTimeZoneByOffset = useCallback((utcOffset: number): ITimeZones => {
    const russianTimeZones: Record<ITimeZones, number> = {
      [ITimeZones.KALININGRAD]: 2,
      [ITimeZones.MOSCOW]: 3,
      [ITimeZones.SAMARA]: 4,
      [ITimeZones.EKATERINBURG]: 5,
      [ITimeZones.OMSK]: 6,
      [ITimeZones.KRASNOYARSK]: 7,
      [ITimeZones.IRKUTSK]: 8,
      [ITimeZones.YAKUTSK]: 9,
      [ITimeZones.VLADIVOSTOK]: 10,
      [ITimeZones.MAGADAN]: 11,
      [ITimeZones.KAMCHATKA]: 12
    };

    let closestZone = ITimeZones.MOSCOW;
    let smallestDiff = Math.abs(russianTimeZones[ITimeZones.MOSCOW] - utcOffset);

    (Object.entries(russianTimeZones) as [string, number][]).forEach(([zone, offset]) => {
      const diff = Math.abs(offset - utcOffset);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestZone = parseInt(zone) as ITimeZones;
      }
    });

    return closestZone;
  }, []);

  // Проверка обязательных полей
  const hasRequiredFields = useMemo(() => {
    if (anonym) {
      // Для анонимного пользователя: телефон, почта, часовой пояс
      return !!(userDetails.phone &&
        userDetails.email &&
        userDetails.time_zone);
    } else {
      // Для неанонимного пользователя: имя, фамилия, телефон, почта, пол, дата рождения
      return !!(userDetails.name &&
        userDetails.surname &&
        userDetails.phone &&
        userDetails.email &&
        userDetails.gender &&
        userDetails.date_birth);
    }
  }, [anonym, userDetails]);

  // Проверка валидности email и телефона
  const hasValidCredentials = useMemo(() => {
    return styleEmail === 'valid' && stylePhone === 'valid';
  }, [styleEmail, stylePhone]);

  // Обновление состояния кнопки
  useEffect(() => {
    setDisabled(!(hasRequiredFields && hasValidCredentials));
  }, [hasRequiredFields, hasValidCredentials]);

  // Проверка на существование пользователя по почте
  useEffect(() => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(userDetails.email || "")) {
      const checkAuth = async () => {
        try {
          const isAuth = await store.checkUser(userDetails.email);
          if (isAuth.success) {
            setStyleEmail('invalid');
            setError('Пользователь с такой электронной почтой существует');
          } else {
            setStyleEmail('valid');
            setError("");
          }
        } catch (error) {
          console.error('Ошибка проверки email:', error);
          setStyleEmail("");
        }
      };
      checkAuth();
    } else {
      setStyleEmail("");
    }
  }, [userDetails.email, setError, store]);

  // Проверка на существование пользователя по телефону
  useEffect(() => {
    if (userDetails?.phone?.length === 18) { // Предполагаем, что форматированный телефон имеет длину 18 символов
      const checkAuth = async () => {
        try {
          const isAuth = await store.checkUser(userDetails.phone);
          if (isAuth.success) {
            setStylePhone("invalid");
            setError("Пользователь с таким номером телефона существует");
          } else {
            setStylePhone("valid");
            setError("");
          }
        } catch (error) {
          console.error('Ошибка проверки телефона:', error);
          setStylePhone("");
        }
      };
      checkAuth();
    } else {
      setStylePhone('');
    }
  }, [userDetails?.phone, setError, store]);

  // Завершение первого этапа 
  const handleStep1 = useCallback((): void => {
    if (!hasRequiredFields) {
      setError("Заполните все обязательные поля!");
      return;
    }

    if (!hasValidCredentials) {
      setError("Проверьте правильность email и телефона");
      return;
    }

    setStep(2);
    setError("");
  }, [hasRequiredFields, hasValidCredentials, setError]);

  // Завершение регистрации
  const registration = useCallback(async (): Promise<void> => {
    if (userDetails.date_birth && !anonym) {
      const age = calculateAge(userDetails.date_birth);
      if (age < 18 || age > 100) {
        setError("Возраст должен быть от 18 до 100 лет");
        return;
      }
    }

    if (replyPinCode !== userDetails.pin_code) {
      setError("Пин-коды не совпадают!");
      return;
    }

    try {
      const detectedTimeZone = await detectUserTimeZone();
      const formattedDateBirth = userDetails.date_birth ? userDetails.date_birth.replace(/\./g, '-') : '';

      const updatedUserDetails: RegistrationData = {
        ...userDetails,
        time_zone: detectedTimeZone,
        date_birth: formattedDateBirth,
        isAnonymous: anonym
      };

      setError("");
      await store.registration(updatedUserDetails);

      if (store.isAuth) {
        navigate(RouteNames.PERSONAL);
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setError("Произошла ошибка при регистрации");
    }
  }, [userDetails, anonym, replyPinCode, calculateAge, detectUserTimeZone, setError, store, navigate]);

  // Возвращение на один этап
  const handleBack = useCallback((): void => {
    setError("");
    setStep(prev => prev - 1);
  }, [setError]);

  // Добавить что-то к данным пользователя
  const handleUserDetailsChange = useCallback((field: keyof RegistrationData, value: string | boolean | number | Gender | Role | undefined): void => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  const SetPinCode = useCallback((pin: string) => {
    handleUserDetailsChange('pin_code', pin);
  }, [handleUserDetailsChange]);

  const handleAgreementChange = useCallback((isChecked: boolean) => {
    setDisabled(!isChecked);
  }, []);

  const handleLinkClick = useCallback(() => {
    console.log('Нажатие на ссылку');
  }, []);

  const anonymSet = useCallback((value: boolean) => {
    setAnonym(value);
    handleUserDetailsChange("isAnonymous", value);
  }, [handleUserDetailsChange]);

  if (store.loading) return <Loader />;

  return (
    <div className="auth__container">
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
                id="anonym"
                name="anonym"
                checked={anonym}
                onChange={e => anonymSet(e.target.checked)}
              />
              <label htmlFor="anonym">Анонимная регистрация</label>
            </div>

            {!anonym && (
              <>
                <MyInput
                  id="surname"
                  label="Фамилия"
                  value={userDetails.surname || ""}
                  onChange={(value) => handleUserDetailsChange("surname", value)}
                  required
                  className={!userDetails.surname ? 'required-field' : ''}
                />

                <MyInput
                  id="name"
                  label="Имя"
                  value={userDetails.name || ""}
                  onChange={(value) => handleUserDetailsChange("name", value)}
                  required
                  className={!userDetails.name ? 'required-field' : ''}
                />

                <MyInput
                  id="patronymic"
                  label="Отчество (Если есть)"
                  value={userDetails.patronymic || ""}
                  onChange={(value) => handleUserDetailsChange("patronymic", value)}
                />
              </>
            )}

            <MyInputTel
              id="phone"
              value={userDetails.phone || ""}
              onChange={(value) => handleUserDetailsChange("phone", value)}
              className={`${stylePhone} ${!userDetails.phone ? 'required-field' : ''}`}
              required
            />

            <MyInputEmail
              id="email"
              value={userDetails.email || ""}
              onChange={(value) => handleUserDetailsChange("email", value)}
              className={`${styleEmail} ${!userDetails.email ? 'required-field' : ''}`}
              label="Электронная почта"
              placeholder="your@email.com"
              required
            />

            {!anonym && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div className="auth__radio-btn">
                    <input
                      id="male"
                      type="radio"
                      name="gender"
                      value="Мужчина"
                      checked={userDetails.gender === "Мужчина"}
                      onChange={(e) => handleUserDetailsChange("gender", e.target.value as Gender)}
                    />
                    <label htmlFor="male">Мужчина</label>
                  </div>

                  <div className="auth__radio-btn">
                    <input
                      id="female"
                      type="radio"
                      name="gender"
                      value="Женщина"
                      checked={userDetails.gender === "Женщина"}
                      onChange={(e) => handleUserDetailsChange("gender", e.target.value as Gender)}
                    />
                    <label htmlFor="female">Женщина</label>
                  </div>
                </div>

                <MyInputDate
                  id="date-birth"
                  label="Дата рождения"
                  value={userDetails.date_birth || ""}
                  onChange={(value) => handleUserDetailsChange("date_birth", value)}
                  className={!userDetails.date_birth ? 'required-field' : ''}
                />
              </>
            )}

            {/* Часовой пояс для анонимных пользователей */}
            {anonym && (
              <MySelect
                value={userDetails.time_zone.toString() || ""}
                onChange={(value) => handleUserDetailsChange("time_zone", value)}
                label="Часовой пояс"
                defaultValue=""
                required
                className={!userDetails.time_zone ? 'required-field' : ''}
              >
                <option value="">Выбрать</option>
                {Object.entries(TimeZoneLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </MySelect>
            )}

            <CheckBox
              onAgreementChange={handleAgreementChange}
              onLinkClick={handleLinkClick}
            />

            <button
              className="auth__button step1"
              onClick={handleStep1}
              disabled={disabled}
              type="button"
            >
              Продолжить
            </button>
            <a
              onClick={() => setState("login")}
              className="auth__toggle-button"
              type="button"
            >
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
            <div className="solutions__warn">
              <span>
                PIN-код нужен для безопасности ваших данных. Если вы забудете PIN-код, то потребуется пройти регистрацию повторно.
              </span>
            </div>
            <br />

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

              <button
                onClick={registration}
                className="auth__button__final"
                type="button"
              >
                Завершить регистрацию
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="auth__button"
              >
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