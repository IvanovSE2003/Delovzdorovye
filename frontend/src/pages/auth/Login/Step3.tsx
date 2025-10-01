import PinCodeInput from "../../../components/UI/PinCodeInput/PinCodeInput";
import AnimatedBlock from "../../../components/AnimatedBlock";

interface Step3Props {
  handelStep3: (pin: string) => void;
  handleBack: () => void;
  handleResendCode: () => void;
  timeLeft: number;
  isResending: boolean;
}

const Step3: React.FC<Step3Props> = ({
  handelStep3,
  handleBack,
  handleResendCode,
  timeLeft,
  isResending,
}) => {
  return (
    <AnimatedBlock className="auth__form">
      <h2 className="auth__form__title">Введите полученный код</h2>

      <PinCodeInput onLogin={handelStep3} countNumber={6} clearOnComplete />

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
    </AnimatedBlock>
  );
};

export default Step3;
