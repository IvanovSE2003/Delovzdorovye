import AnimatedBlock from "../../../components/AnimatedBlock";
import PinCodeInput from "../../../components/UI/PinCodeInput/PinCodeInput";

interface Step3Props {
    handleStep3: (pin: string) => void;
    handleBack: () => void;
}

const Step3: React.FC<Step3Props> = ({ handleStep3, handleBack }) => {
    return (
        <AnimatedBlock className="auth__form">
            <h2 className='auth__form__title'>Введите код, отправленный на почту</h2>
            <br />
            <PinCodeInput
                countNumber={6}
                onLogin={handleStep3}
            />
            <br />
            <button
                type="button"
                onClick={handleBack}
                className="auth__button"
            >
                Назад
            </button>
        </AnimatedBlock>
    )
}

export default Step3;