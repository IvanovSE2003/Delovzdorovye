import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { Context } from "../../main";
import { motion, AnimatePresence } from "framer-motion";

import MyInput from "../../components/UI/MyInput/MyInput";
import PinCodeInput from "../../components/UI/PinCodeInput/PinCodeInput";

import type { FormAuthProps } from "../../models/Auth";
import { observer } from "mobx-react-lite";
import { RouteNames } from "../../routes";
import Loader from "../../components/UI/Loader/Loader";
import MyInputTel from "../../components/UI/MyInput/MyInputTel";

const Login: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const [method, setMethod] = useState<"SMS" | "EMAIL">("SMS");
  const [step, setStep] = useState<number>(1);
  const [emailOrphone, setEmailOrPhone] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);


  // Анимации
  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const checkAuth = async () => {
    setError("");
    const isAuth = await store.checkUser(emailOrphone);
    return isAuth.success;
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

  // Завершение 1 этапа
  const checkContact = async () => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      setError("Пользователь не найден");
      return;
    }

    if (method === "EMAIL") {
      const correctEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrphone);
      if (!correctEmail) {
        setError("Введите корректный email");
        return;
      }
    } else {
      const phoneDigits = emailOrphone.replace(/\D/g, "");
      const correctPhone = phoneDigits.length === 11 && (phoneDigits.startsWith('7') || phoneDigits.startsWith('8'));
      if (!correctPhone) {
        setError("Введите корректный номер телефона (+7 XXX XXX XX XX)");
        return;
      }
    }

    setError("");
    setStep(2);
  };

  // Завершение 2 этапа
  const login = async (code: string) => {
    const correctCode = /^\d{4}$/.test(code);
    if (!correctCode)
      setError("Не корректно введен код!");
    else {
      const data = await store.login({ creditial: emailOrphone, twoFactorMethod: method, pin_code: Number(code) });
      data.success && setStep(3);
    }
  };

  // Завершение 3 этапа
  const completeTwoFactor = async (code: string) => {
    if (code === "") {
      setError("Введите код!");
      return;
    }
    await store.completeTwoFactor(localStorage.getItem('tempToken'), code);
    if (localStorage.getItem("Token")) navigate(RouteNames.PERSONAL);
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

  if (store.loading) return <Loader />

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
            {method === "SMS" ? (
              <MyInputTel
                id="phone"
                label="Номер телефона"
                value={emailOrphone}
                onChange={setEmailOrPhone}
                required
              />

            ) : (
              <MyInput
                type="email"
                id="email"
                label="Электронная почта"
                value={emailOrphone}
                onChange={setEmailOrPhone}
                required
              />
            )}



            <button onClick={checkContact} className="auth__button">
              Продолжить
            </button>

            <a onClick={toggleAuthType} className="auth__toggle-button">
              {method === "EMAIL" ? "Войти по телефону" : "Войти по почте"}
            </a>

            <a
              onClick={() => setState("register")}
              className="auth__toggle-button"
            >
              Зарегистрироваться
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
            <div className="auth__form">
              <h2>Введите ваш пин-код</h2>
              <PinCodeInput onLogin={login} countNumber={4} />
              <button className="auth__button" onClick={handleBack}>
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
              <h2>Введите полученный код</h2>
              <PinCodeInput onLogin={completeTwoFactor} countNumber={6} />

              <div className="auth__resend-code">
                {timeLeft > 0 ? (
                  <span className="auth__timer">
                    Отправить код повторно через {timeLeft} сек
                  </span>
                ) : (
                  <a className="auth__resend-button" onClick={handleResendCode}>
                    {isResending ? "Отправка..." : "Отправить код повторно"}
                  </a>
                )}
              </div>

              <button className="auth__button" onClick={handleBack}>
                Назад
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default observer(Login);
