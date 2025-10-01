import MyInputTel from "../../../components/UI/MyInput/MyInputTel";
import MyInputEmail from "../../../components/UI/MyInput/MyInputEmail";
import AnimatedBlock from "../../../components/AnimatedBlock";

interface Step1Props {
  method: "SMS" | "EMAIL";
  emailOrPhone: string;
  setEmailOrPhone: (value: string) => void;
  setIsErrorTelOrEmail: (isError: boolean) => void;
  formValidation: { canSubmit: boolean };
  handelStep1: () => void;
  toggleAuthType: () => void;
  setState: (value: "login" | "register") => void;
}

const Step1: React.FC<Step1Props> = ({
  method,
  emailOrPhone,
  setEmailOrPhone,
  setIsErrorTelOrEmail,
  formValidation,
  handelStep1,
  toggleAuthType,
  setState,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formValidation.canSubmit) {
      handelStep1();
    }
  };

  return (
    <AnimatedBlock className="auth__form">
      <form onSubmit={handleSubmit}>
        {method === "SMS" ? (
          <MyInputTel
            id="phone"
            label="Номер телефона"
            value={emailOrPhone}
            onChange={setEmailOrPhone}
            getIsError={setIsErrorTelOrEmail}
            required
          />
        ) : (
          <MyInputEmail
            id="email"
            value={emailOrPhone}
            onChange={setEmailOrPhone}
            getIsError={setIsErrorTelOrEmail}
            label="Электронная почта"
            placeholder="your@email.com"
            required
          />
        )}

        <button
          type="submit"
          className="auth__button"
          disabled={!formValidation.canSubmit}
          style={{
            opacity: !formValidation.canSubmit ? 0.6 : 1,
            cursor: !formValidation.canSubmit ? "not-allowed" : "pointer",
          }}
        >
          Продолжить
        </button>
      </form>

      <a onClick={toggleAuthType} className="auth__toggle-button">
        {method === "EMAIL" ? "Войти по телефону" : "Войти по почте"}
      </a>

      <a
        onClick={() => setState("register")}
        className="auth__toggle-button"
      >
        Зарегистрироваться
      </a>
    </AnimatedBlock>
  );
};

export default Step1;