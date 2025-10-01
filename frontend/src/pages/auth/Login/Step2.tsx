import AnimatedBlock from "../../../components/AnimatedBlock";
import PinCodeInput from "../../../components/UI/PinCodeInput/PinCodeInput";

interface Step2Props {
  handelStep2: (pin: string) => void;
  handleBack: () => void;
}

const Step2: React.FC<Step2Props> = ({
  handelStep2,
  handleBack,
}) => {
  return (
    <AnimatedBlock className="auth__form">
      <h2 className="auth__form__title">Введите ваш пин-код</h2>
      <PinCodeInput onLogin={handelStep2} countNumber={4} clearOnComplete />

      <button className="auth__button" onClick={handleBack}>
        Назад
      </button>
    </AnimatedBlock>
  );
};

export default Step2;
