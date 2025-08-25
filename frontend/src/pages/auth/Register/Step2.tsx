import { motion } from "framer-motion";
import PinCodeInput from "../../../components/UI/PinCodeInput/PinCodeInput";

interface Step2FormProps {
  step: number;
  stepVariants: any;
  SetPinCode: (code: string) => void;
  setReplyPinCode: (code: string) => void;
  registration: () => void;
  handleBack: () => void;
}

const Step2Form: React.FC<Step2FormProps> = ({
  step,
  stepVariants,
  SetPinCode,
  setReplyPinCode,
  registration,
  handleBack,
}) => {
  return (
    <motion.div
      key={step}
      initial="enter"
      animate="center"
      exit="exit"
      variants={stepVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="solutions__warn">
        <span>
          PIN-код нужен для безопасности ваших данных. Если вы забудете PIN-код, то потребуется пройти регистрацию повторно.
        </span>
      </div>
      <br />

      <div className="auth__form">
        <h2>Придумайте пин-код</h2>
        <PinCodeInput onLogin={SetPinCode} countNumber={4} />

        <h2>Повторите пин-код</h2>
        <PinCodeInput onLogin={setReplyPinCode} countNumber={4} />

        <button
          onClick={registration}
          className="auth__button__final"
          type="button"
        >
          Завершить регистрацию
        </button>

        <button
          type="button"
          onClick={handleBack}
          className="auth__button"
        >
          Назад
        </button>
      </div>
    </motion.div>
  );
};

export default Step2Form;
