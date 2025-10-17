import PinCodeInput from "../../../components/UI/PinCodeInput/PinCodeInput";
import AnimatedBlock from "../../../components/AnimatedBlock";
import { useEffect, useState, useRef } from "react";

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
  const [firstPinComplete, setFirstPinComplete] = useState(false);
  const secondPinRef = useRef<{ focus: () => void } | null>(null);

  // Обработчик для первого пин-кода
  const handleFirstPinComplete = (code: string) => {
    SetPinCode(code);
    setFirstPinComplete(true);
  };

  // Фокусируемся на втором пин-коде, когда первый завершен
  useEffect(() => {
    if (firstPinComplete && secondPinRef.current) {
      // Небольшая задержка для гарантии, что компонент обновился
      setTimeout(() => {
        secondPinRef.current?.focus();
      }, 0);
    }
  }, [firstPinComplete]);

  // Обработчик нажатия клавиши Enter
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        registration();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [registration]);

  return (
    <AnimatedBlock className="auth__form">
      <div className="solutions__warn">
        <span>
          PIN-код нужен для безопасности ваших данных. Если вы забудете PIN-код, то необходимо будет заново зарегистрироваться, информация о консультациях будет утеряна.
        </span>
      </div>
      <br />

      <div className="auth__form">
        <h2 className="auth__form__title">Придумайте пин-код</h2>
        <PinCodeInput 
          onLogin={handleFirstPinComplete} 
          focus={true}
          countNumber={4} 
          clearOnComplete={false}
        />

        <h2 className="auth__form__title">Повторите пин-код</h2>
        <PinCodeInput 
          onLogin={setReplyPinCode} 
          focus={firstPinComplete} 
          countNumber={4}
          ref={secondPinRef}
        />

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