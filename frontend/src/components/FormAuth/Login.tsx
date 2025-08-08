import { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router';
import { Context } from "../../main";
import { motion, AnimatePresence } from "framer-motion";

import MyInput from "../UI/MyInput/MyInput";
import PinCodeInput from "./PinCodeInput/PinCodeInput";

import type { FormAuthProps } from "../../models/Auth";
import { observer } from "mobx-react-lite";
import { RouteNames } from "../../routes";

const Login: React.FC<FormAuthProps> = ({ setState, setError }) => {
  const navigate = useNavigate();
  const [isEmailAuth, setIsEmailAuth] = useState<boolean>(false);
  const [styleInput, setStyleInput] = useState<string>("");
  const [step, setStep] = useState<number>(1);

  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const { store } = useContext(Context);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Анимации
  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  };

  useEffect(() => {
    if (phone.length === 11) {
      const checkAuth = async () => {
        const isAuth = await store.checkUser(phone, email);
        if (isAuth.check) setError("");
        setStyleInput(isAuth.check ? 'valid' : 'invalid');
      };
      checkAuth();
    } else {
      setStyleInput('');
    }
  }, [phone]);

  useEffect(() => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(email)) {
      const checkAuth = async () => {
        const isAuth = await store.checkUser(phone, email);
        setStyleInput(isAuth.check ? 'valid' : 'invalid');
      };
      checkAuth();
    } else {
      setStyleInput('');
    }
  }, [email]);

  useEffect(() => {
    setError(store.error);
  }, [store.error])

  useEffect(() => {
    if (timeLeft > 0 && step === 2) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Завершение 1 этапа
  const checkContact = async () => {
    if (styleInput === 'invalid') {
      setError("Пользователь не найден");
      return;
    }

    if (isEmailAuth) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailValid) {
        setError("Введите корректный email");
        return;
      }
      await store.twoFactorSend("EMAIL", phone, email);
    } else {
      const phoneValid = /^8\d{10}$/.test(phone);
      if (!phoneValid) {
        setError("Введите корректный номер телефона (8XXXXXXXXXX)");
        return;
      }
      await store.twoFactorSend("SMS", phone, email);
    }

    setError("");
    setStep(2);
  };

  // Завершение 2 этапа
  const checkCode = async (code: string) => {
    const isValidCode = /^\d{6}$/.test(code)
    if (!isValidCode) {
      setError("Не корректно введен код!");
    } else {
      let data;
      isEmailAuth
        ? data = await store.checkVarifyCode(code, email)
        : data = await store.checkVarifyCodeSMS(code, phone);

      if (data.success) setStep(3);
    }
  }

  // Завершение 3 этапа
  const login = async (pin: string) => {
    setError("");
    await store.login({ phone, email, pin_code: Number(pin) });
    if (store.isAuth) navigate(RouteNames.PERSONAL);
  }

  // Переключение почта/телефон
  const toggleAuthType = (): void => {
    setIsEmailAuth((prev) => !prev);
    setPhone("");
    setEmail("");
    setError("");
  };

  // Вернуться на прошлый шаг
  const handleBack = () => {
    setError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Отправить код заново
  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // Здесь ваш запрос на повторную отправку кода
      isEmailAuth
        ? await store.twoFactorSend("EMAIL", phone, email)
        : await store.twoFactorSend("SMS", phone, email);
      setTimeLeft(60);
    } catch (error) {
      console.error('Ошибка при повторной отправке:', error);
    } finally {
      setIsResending(false);
    }
  };

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
            {!isEmailAuth ? (
              <MyInput
                type="tel"
                id="phone"
                label="Номер телефона"
                value={phone}
                onChange={setPhone}
                maxLength={11}
                required
                className={styleInput}
              />
            ) : (
              <MyInput
                type="email"
                id="email"
                label="Электронная почта"
                value={email}
                onChange={setEmail}
                className={styleInput}
                required
              />
            )}

            <button onClick={checkContact} className="auth__button">
              Получить код
            </button>

            <a onClick={toggleAuthType} className="auth__toggle-button">
              {isEmailAuth ? "Войти по телефону" : "Войти по почте"}
            </a>
            <a onClick={() => setState("register")} className="auth__toggle-button">
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
              <h2>Введите полученный код</h2>
              <PinCodeInput
                onLogin={checkCode}
                countNumber={6}
              />

              <div className="auth__resend-code">
                {timeLeft > 0 ? (
                  <span className="auth__timer">
                    Отправить код повторно через {timeLeft} сек
                  </span>
                ) : (
                  <a
                    className="auth__resend-button"
                    onClick={handleResendCode}
                  >
                    {isResending ? 'Отправка...' : 'Отправить код повторно'}
                  </a>
                )}
              </div>

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
              <h2>Введите ваш пин-код</h2>
              <PinCodeInput
                onLogin={login}
                countNumber={4}
              />
              <button className="auth__button" onClick={handleBack}>
                Назад
              </button>
              <a onClick={() => setState("recover")} className="auth__toggle-button">
                Забыл пин-код
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default observer(Login);