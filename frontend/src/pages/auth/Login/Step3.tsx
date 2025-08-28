import { motion } from "framer-motion";
import PinCodeInput from "../../../components/UI/PinCodeInput/PinCodeInput";

interface Step3Props {
  handelStep3: (pin: string) => void;
  handleBack: () => void;
  handleResendCode: () => void;
  stepVariants: any;
  timeLeft: number;
  isResending: boolean;
}

const Step3: React.FC<Step3Props> = ({
  handelStep3,
  handleBack,
  handleResendCode,
  stepVariants,
  timeLeft,
  isResending,
}) => {
  return (
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

        <PinCodeInput onLogin={handelStep3} countNumber={6} />

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
  );
};

export default Step3;
