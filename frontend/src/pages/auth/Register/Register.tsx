import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import "../FormAuth/FormAuth.scss";
import { Context } from "../../../main";
import { AnimatePresence } from "framer-motion";

import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import type { FormAuthProps, RegistrationData, Role, Gender } from "../../../models/Auth";
import { RouteNames } from "../../../routes";
import { ITimeZones } from "../../../models/TimeZones";
import Loader from "../../../components/UI/Loader/Loader";

import Step1Form from "./Step1";
import Step2Form from "./Step2";

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
};

const Register: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const navigate = useNavigate();
  const { store } = useContext(Context);

  const [disabled, setDisabled] = useState<boolean>(true);
  const [isCheck, setIsCheck] = useState<boolean>(true);

  const [userDetails, setUserDetails] = useState<RegistrationData>({} as RegistrationData);
  const [step, setStep] = useState<number>(1);
  const [replyPinCode, setReplyPinCode] = useState<string>("");
  const [anonym, setAnonym] = useState<boolean>(false);


  // Стираю ошибку при изменении шага 
  useEffect(() => {
    setError("");
  }, [step, setError]);

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
      // Для анонимного пользователя: телефон, почта
      return !!(userDetails.phone &&
        userDetails.email);
    } else {
      // Для неанонимного пользователя: дата рождения должна быть полностью введена (ДД.ММ.ГГГГ)
      const isDateValid = !!(userDetails.date_birth && userDetails.date_birth.length === 10);
      return !!(userDetails.name &&
        userDetails.surname &&
        userDetails.phone &&
        userDetails.email &&
        userDetails.gender &&
        isDateValid);
    }
  }, [anonym, userDetails]);


  // Обновление состояния кнопки
  useEffect(() => {
    setDisabled(!(hasRequiredFields && isCheck));
  }, [hasRequiredFields, isCheck]);

  // Завершение первого этапа 
  const handleStep1 = useCallback(async (): Promise<void> => {
    if (!hasRequiredFields) {
      setError("Заполните все обязательные поля!");
      return;
    }

    try {
      const [phoneCheck, emailCheck] = await Promise.allSettled([
        store.checkUser(userDetails.phone),
        store.checkUser(userDetails.email)
      ]);

      if (phoneCheck.status === 'fulfilled' && phoneCheck.value.success) {
        setError("Пользователь с таким номером телефона уже существует");
        return;
      } else if (phoneCheck.status === 'rejected') {
        console.error('Ошибка проверки телефона:', phoneCheck.reason);
      }

      if (emailCheck.status === 'fulfilled' && emailCheck.value.success) {
        setError("Пользователь с такой почтой уже существует!");
        return;
      } else if (emailCheck.status === 'rejected') {
        console.error('Ошибка проверки email:', emailCheck.reason);
      }

      const phoneExists = phoneCheck.status === 'fulfilled' && phoneCheck.value.success;
      const emailExists = emailCheck.status === 'fulfilled' && emailCheck.value.success;

      if (!phoneExists && !emailExists) {
        setStep(2);
        setError("");
      } else if (phoneExists && emailExists) {
        setError("Пользователь с таким номером телефона и почтой уже существует");
      }

    } catch (error) {
      console.error('Неожиданная ошибка при проверке пользователя:', error);
      setError("Произошла ошибка при проверке данных");
    }
  }, [hasRequiredFields, setError, userDetails.phone, userDetails.email, store]);

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

      // Подготавливаем данные для регистрации
      const registrationData: Partial<RegistrationData> = {
        ...userDetails,
        time_zone: detectedTimeZone,
        email: userDetails.email?.toLowerCase(),
        isAnonymous: anonym
      };

      if (anonym) {
        delete registrationData.date_birth;
        delete registrationData.name;
        delete registrationData.surname;
        delete registrationData.patronymic;
        delete registrationData.gender;
      } else {
        registrationData.date_birth = userDetails.date_birth ?
          userDetails.date_birth.replace(/\./g, '-') : '';
      }

      setError("");
      await store.registration(registrationData as RegistrationData);

      if (store.isAuth) {
        navigate(RouteNames.PERSONAL);
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setError("Произошла ошибка при регистрации");
    }
  }, [userDetails, anonym, replyPinCode, calculateAge, detectUserTimeZone, setError, store, navigate]);

  const handleBack = useCallback((): void => {
    setError("");
    setStep(prev => prev - 1);
  }, [setError]);

  const handleUserDetailsChange = useCallback((field: keyof RegistrationData, value: string | boolean | number | Gender | Role | undefined): void => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  const SetPinCode = useCallback((pin: string) => {
    handleUserDetailsChange('pin_code', pin);
  }, [handleUserDetailsChange]);

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
          <Step1Form
            step={step}
            anonym={anonym}
            anonymSet={anonymSet}
            userDetails={userDetails}
            handleUserDetailsChange={handleUserDetailsChange}
            setIsCheck={setIsCheck}
            handleLinkClick={handleLinkClick}
            handleStep1={handleStep1}
            disabled={disabled}
            setState={setState}
            stepVariants={stepVariants}
          />
        )}

        {step === 2 && (
          <Step2Form
            step={step}
            stepVariants={stepVariants}
            SetPinCode={SetPinCode}
            setReplyPinCode={setReplyPinCode}
            registration={registration}
            handleBack={handleBack}
          />
        )}

      </AnimatePresence>
    </div>
  );

};

export default observer(Register);