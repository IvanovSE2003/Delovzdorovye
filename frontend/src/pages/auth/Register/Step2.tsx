import PinCodeInput from "../../../components/UI/PinCodeInput/PinCodeInput";
import AnimatedBlock from "../../../components/AnimatedBlock";

interface Step2FormProps {
  SetPinCode: (code: string) => void;
  setReplyPinCode: (code: string) => void;
  registration: () => void;
  handleBack: () => void;
}

const Step2Form: React.FC<Step2FormProps> = ({
  SetPinCode,
  setReplyPinCode,
  registration,
  handleBack,
}) => {
  return (
    <AnimatedBlock className="auth__form">
      <div className="solutions__warn">
        <span>
          PIN-код нужен для безопасности ваших данных. Если вы забудете PIN-код, то попробуйте его востановить.
        </span>
      </div>
      <br />

      <div className="auth__form">
        <h2 className="auth__form__title">Придумайте пин-код</h2>
        <PinCodeInput onLogin={SetPinCode} countNumber={4} />

        <h2 className="auth__form__title">Повторите пин-код</h2>
        <PinCodeInput onLogin={setReplyPinCode} countNumber={4} />

        <button
          onClick={registration}
          className="auth__button__final"
          type="button"
        >
          Продолжить
        </button>

        <button
          type="button"
          onClick={handleBack}
          className="auth__button"
        >
          Назад
        </button>
      </div>
    </AnimatedBlock>
  );
};

export default Step2Form;
