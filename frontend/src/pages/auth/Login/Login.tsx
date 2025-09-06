import { lazy, Suspense, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../main";
import { AnimatePresence } from "framer-motion";
import type { FormAuthProps } from "../../../models/Auth";
import { observer } from "mobx-react-lite";
import { RouteNames } from "../../../routes";

import Loader from "../../../components/UI/Loader/Loader";

const Step1 = lazy(() => import("./Step1"));
const Step2 = lazy(() => import("./Step2"));
const Step3 = lazy(() => import("./Step3"));


const Login: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [method, setMethod] = useState<"SMS" | "EMAIL">("SMS");
  const [step, setStep] = useState<number>(1);
  const [emailOrphone, setEmailOrPhone] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isErrorTelOrEmail, setIsErrorTelOrEmail] = useState<boolean>(true);

  // Анимации
  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  // Проверка пользователя на существование в БД
  const checkAuth = async () => {
    setError("");
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
      setError(formValidation.errorMessage);
      return;
    }

    const isAuth = await checkAuth();
    if (!isAuth) {
      setError("Пользователь не найден");
      return;
    }

    setError("");
    setStep(2);
  };

  // Завершение 2 шага
  const handelStep2 = async (code: string) => {
    const correctCode = /^\d{4}$/.test(code);
    if (!correctCode)
      setError("Не корректно введен код!");
    else {
      const data = await store.login({ creditial: emailOrphone, twoFactorMethod: method, pin_code: Number(code) });
      data.success && setStep(3);
    }
  };

  // Завершение 3 шага
  const handelStep3 = async (code: string) => {
    if (code === "") {
      setError("Введите код!");
      return;
    }
    const data = await store.completeTwoFactor(localStorage.getItem('tempToken'), code);
    console.log(data);
    if(data.success) navigate(RouteNames.PERSONAL);
    else setError('Ошибка при входе!');
  };

  // Переключение почта/телефон
  const toggleAuthType = (): void => {
    method === "SMS"
      ? setMethod("EMAIL")
      : setMethod("SMS");
    setEmailOrPhone("");
    setError("");
  };

  // Вернуться на прошлый шаг
  const handleBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  // Отправить код заново
  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await store.twoFactorSend(method, emailOrphone);
      setTimeLeft(60);
    } catch (error) {
      console.error("Ошибка при повторной отправке:", error);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    setError(store.error);
  }, [store.error]);

  useEffect(() => {
    setError("")
  }, [step])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  if (store.loading) return <Loader />

  return (
    <div className="auth__container">
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default observer(Login);
