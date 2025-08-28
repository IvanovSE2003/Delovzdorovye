import { motion } from "framer-motion";
import PinCodeInput from "../../../components/UI/PinCodeInput/PinCodeInput";

interface Step2Props {
  handelStep2: (pin: string) => void;
  handleBack: () => void;
  stepVariants: any;
}

const Step2: React.FC<Step2Props> = ({
  handelStep2,
  handleBack,
  stepVariants,
}) => {
  return (
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
        <PinCodeInput onLogin={handelStep2} countNumber={4} />

        <button className="auth__button" onClick={handleBack}>
          Назад
        </button>
      </div>
    </motion.div>
  );
};

export default Step2;
