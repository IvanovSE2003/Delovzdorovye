import { lazy, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../main";
import type { FormAuthProps } from "../../../models/Auth";
import { observer } from "mobx-react-lite";
import { defaultRoleRoutes } from "../../../routes";
import { processError } from "../../../helpers/processError";
import Loader from "../../../components/UI/Loader/Loader";

const Step1 = lazy(() => import("./Step1"));
const Step2 = lazy(() => import("./Step2"));
const Step3 = lazy(() => import("./Step3"));

const Login: React.FC<FormAuthProps> = ({ setState, setError, setMessage }) => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const [method, setMethod] = useState<"SMS" | "EMAIL">("SMS");
  const [step, setStep] = useState<number>(1);
  const [emailOrphone, setEmailOrPhone] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isErrorTelOrEmail, setIsErrorTelOrEmail] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  // Анимации
  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  // Проверка пользователя на существование в БД
  const checkAuth = async () => {
    setError({id: 0, message: ""});
    const isAuth = await store.checkUser(emailOrphone);
    return isAuth.success;
  };

  // Валидация данных для первого этапа
  const formValidation = useMemo(() => {
    const hasValue = !!emailOrphone.trim();
    let isValid = false;
    let errorMessage = "";

    if (hasValue) {
      if (method === "EMAIL") {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrphone);
        errorMessage = isValid ? "" : "Введите корректный email";
      } else {
        const phoneDigits = emailOrphone.replace(/\D/g, "");
        isValid = phoneDigits.length === 11 &&
          (phoneDigits.startsWith('7') || phoneDigits.startsWith('8'));
        errorMessage = isValid ? "" : "Введите корректный номер телефона (+7 XXX XXX XX XX)";
      }
    }

    return {
      hasValue,
      isValid,
      errorMessage,
      canSubmit: hasValue && isValid && !isErrorTelOrEmail
    };
  }, [emailOrphone, method, isErrorTelOrEmail]);

  // Завершение 1 шага
  const handelStep1 = async () => {
    if (!formValidation.isValid) {
      setError({id: Date.now(), message: formValidation.errorMessage});
      return;
    }

    const isAuth = await checkAuth();
    if (!isAuth) {
      setError({id: Date.now(), message: "Пользователь не найден"});
      return;
    }

    setError({id: 0, message: ""});
    setStep(2);
  };

  // Завершение 2 шага
  const handelStep2 = async (code: string) => {
    const correctCode = /^\d{4}$/.test(code);
    if (!correctCode)
      setError({id: Date.now(), message: "Не корректно введен код!"});
    else {
      const data = await store.login({ creditial: emailOrphone, twoFactorMethod: method, pinCode: code });
      data.success && setStep(3);
    }
  };

  // Завершение 3 шага
  const handelStep3 = async (code: string) => {
    if (code === "") {
      setError({id: Date.now(), message: "Введите код!"});
      return;
    }
    setLoading(true);
    const successLogin = await store.completeLogin(localStorage.getItem('tempToken'), code);
    setLoading(false);
    if (successLogin) navigate(defaultRoleRoutes[store.user.role]);
    else setError({id: Date.now(), message: 'Ошибка при входе!'});
  };

  // Переключение почта/телефон
  const toggleAuthType = (): void => {
    method === "SMS"
      ? setMethod("EMAIL")
      : setMethod("SMS");
    setEmailOrPhone("");
    setError({id: 0, message: ""});
  };

  // Вернуться на прошлый шаг
  const handleBack = () => {
    setError({id: 0, message: ""});
    if (step > 1) setStep(step - 1);
  };

  // Отправить код заново
  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const data = await store.twoFactorSend(method, emailOrphone);
      setMessage && setMessage({id: Date.now(), message: data.message})
      setTimeLeft(60);
    } catch (e) {
      processError(e, "Ошибка при повторной отправке");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    setError({id: 0, message: ""})
  }, [step])

  useEffect(() => {
    if (step === 3 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  if (loading) return <Loader />

  return (
    <div className="auth__container">
      {step === 1 && (
        <Step1
          method={method}
          emailOrPhone={emailOrphone}
          setEmailOrPhone={setEmailOrPhone}
          setIsErrorTelOrEmail={setIsErrorTelOrEmail}
          formValidation={formValidation}
          handelStep1={handelStep1}
          toggleAuthType={toggleAuthType}
          setState={setState}
          stepVariants={stepVariants}
        />
      )}

      {step === 2 && (
        <Step2
          handelStep2={handelStep2}
          handleBack={handleBack}
          stepVariants={stepVariants}
        />
      )}

      {step === 3 && (
        <Step3
          handelStep3={handelStep3}
          handleBack={handleBack}
          handleResendCode={handleResendCode}
          stepVariants={stepVariants}
          timeLeft={timeLeft}
          isResending={isResending}
        />
      )}
    </div>
  );
};

export default observer(Login);
