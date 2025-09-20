import { lazy, useContext, useEffect, useState, useCallback, useMemo } from "react";
import "../FormAuth/FormAuth.scss";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import type { FormAuthProps, RegistrationData, Role, Gender } from "../../../models/Auth";
import { RouteNames } from "../../../routes";
import { ITimeZones } from "../../../models/TimeZones";
import Loader from "../../../components/UI/Loader/Loader";

const Step1Form = lazy(() => import("./Step1"));
const Step2Form = lazy(() => import("./Step2"));
const Step3Form = lazy(() => import("./Step3"));

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
      return !!(userDetails.phone &&
        userDetails.email);
    } else {
      const isDateValid = !!(userDetails.dateBirth && userDetails.dateBirth.length === 10);
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
  const handleStep1 = async () => {
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
  };

  // Завершение второго этапа
  const handleStep2 = async () => {
    if (userDetails.dateBirth && !anonym) {
      const age = calculateAge(userDetails.dateBirth);
      if (age < 18 || age > 100) {
        setError("Возраст должен быть от 18 до 100 лет");
        return;
      }
    }

    if (replyPinCode !== userDetails.pinCode) {
      setError("Пин-коды не совпадают!");
      return;
    }

    try {
      const detectedTimeZone = await detectUserTimeZone();

      // Подготавливаем данные для регистрации
      const registrationData: Partial<RegistrationData> = {
        ...userDetails,
        timeZone: detectedTimeZone,
        email: userDetails.email?.toLowerCase(),
        isAnonymous: anonym
      };

      if (anonym) {
        delete registrationData.dateBirth;
        delete registrationData.name;
        delete registrationData.surname;
        delete registrationData.patronymic;
        delete registrationData.gender;
      } else {
        registrationData.dateBirth = userDetails.dateBirth ?
          userDetails.dateBirth.split('.').reverse().join('-') : '';
      }

      setError("");
      const successStep2 = await store.registration(registrationData as RegistrationData);
      if (successStep2) setStep(3);
      else setError("Ошибка при регистрации");

    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setError("Произошла ошибка при регистрации");
    }
  }

  const handleStep3 = async (pin: string) => {
    if (pin === "") return;

    const successStep3 = await store.completeRegistration(localStorage.getItem('tempToken') || "", pin);
    if (successStep3) navigate(RouteNames.PERSONAL);
    else {
      setError("Ошибка при регистрации");
    }
  }

  const handleBack = useCallback((): void => {
    setError("");
    setStep(prev => prev - 1);
  }, [setError]);

  const handleUserDetailsChange = useCallback((field: keyof RegistrationData, value: string | boolean | number | Gender | Role | undefined): void => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  const SetPinCode = useCallback((pin: string) => {
    handleUserDetailsChange('pinCode', pin);
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
      {step === 1 && (
        <Step1Form
          anonym={anonym}
          anonymSet={anonymSet}
          userDetails={userDetails}
          handleUserDetailsChange={handleUserDetailsChange}
          setIsCheck={setIsCheck}
          handleLinkClick={handleLinkClick}
          handleStep1={handleStep1}
          disabled={disabled}
          setState={setState}
        />
      )}

      {step === 2 && (
        <Step2Form
          SetPinCode={SetPinCode}
          setReplyPinCode={setReplyPinCode}
          registration={handleStep2}
          handleBack={handleBack}
        />
      )}

      {step === 3 && (
        <Step3Form
          handleStep3={handleStep3}
          handleBack={handleBack}
        />
      )}
    </div>
  );

};

export default observer(Register);