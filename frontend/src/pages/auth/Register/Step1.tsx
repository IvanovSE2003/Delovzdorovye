import { motion } from "framer-motion";
import MyInput from "../../../components/UI/MyInput/MyInput";
import MyInputTel from "../../../components/UI/MyInput/MyInputTel";
import MyInputEmail from "../../../components/UI/MyInput/MyInputEmail";
import MyInputDate from "../../../components/UI/MyInput/MyInputDate";
import CheckBox from "../../../components/UI/CheckBox/CheckBox";
import type { Gender, RegistrationData, Role } from "../../../models/Auth";

interface Step1FormProps {
    step: number;
    anonym: boolean;
    anonymSet: (value: boolean) => void;
    userDetails: RegistrationData;
    handleUserDetailsChange: (
        field: keyof RegistrationData,
        value: string | boolean | number | Gender | Role | undefined
    ) => void;
    setIsCheck: (value: boolean) => void;
    handleLinkClick: () => void;
    handleStep1: () => void;
    disabled: boolean;
    setState: (value: string) => void;
    stepVariants: any;
}


const Step1Form: React.FC<Step1FormProps> = ({
    step,
    anonym,
    anonymSet,
    userDetails,
    handleUserDetailsChange,
    setIsCheck,
    handleLinkClick,
    handleStep1,
    disabled,
    setState,
    stepVariants,
}) => {
    return (
        <motion.div
            key={step}
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.2 }}
            className="auth__form"
        >
            <div className="anonym-block">
                <input
                    type="checkbox"
                    id="anonym"
                    name="anonym"
                    checked={anonym}
                    onChange={e => anonymSet(e.target.checked)}
                />
                <label htmlFor="anonym">Анонимная регистрация</label>
            </div>

            {!anonym && (
                <>
                    <MyInput
                        id="surname"
                        label="Фамилия"
                        value={userDetails.surname || ""}
                        onChange={(value) => handleUserDetailsChange("surname", value)}
                        required
                        className={!userDetails.surname ? "required-field" : ""}
                    />

                    <MyInput
                        id="name"
                        label="Имя"
                        value={userDetails.name || ""}
                        onChange={(value) => handleUserDetailsChange("name", value)}
                        required
                        className={!userDetails.name ? "required-field" : ""}
                    />

                    <MyInput
                        id="patronymic"
                        label="Отчество (Если есть)"
                        value={userDetails.patronymic || ""}
                        onChange={(value) => handleUserDetailsChange("patronymic", value)}
                    />
                </>
            )}

            <MyInputTel
                id="phone"
                value={userDetails.phone || ""}
                onChange={(value) => handleUserDetailsChange("phone", value)}
                className={`${!userDetails.phone ? "required-field" : ""}`}
                required
            />

            <MyInputEmail
                id="email"
                value={userDetails.email || ""}
                onChange={(value) => handleUserDetailsChange("email", value)}
                className={`${!userDetails.email ? "required-field" : ""}`}
                label="Электронная почта"
                placeholder="your@email.com"
                required
            />

            {!anonym && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "10px",
                        }}
                    >
                        <div className="auth__radio-btn">
                            <input
                                id="male"
                                type="radio"
                                name="gender"
                                value="Мужчина"
                                checked={userDetails.gender === "Мужчина"}
                                onChange={(e) =>
                                    handleUserDetailsChange("gender", e.target.value)
                                }
                            />
                            <label htmlFor="male">Мужчина</label>
                        </div>

                        <div className="auth__radio-btn">
                            <input
                                id="female"
                                type="radio"
                                name="gender"
                                value="Женщина"
                                checked={userDetails.gender === "Женщина"}
                                onChange={(e) =>
                                    handleUserDetailsChange("gender", e.target.value)
                                }
                            />
                            <label htmlFor="female">Женщина</label>
                        </div>
                    </div>

                    <MyInputDate
                        id="date-birth"
                        label="Дата рождения"
                        value={userDetails.date_birth || ""}
                        onChange={(value) => handleUserDetailsChange("date_birth", value)}
                        className={!userDetails.date_birth ? "required-field" : ""}
                    />
                </>
            )}

            <CheckBox id="check-box" onAgreementChange={setIsCheck} onLinkClick={handleLinkClick} />

            <button
                className="auth__button step1"
                onClick={handleStep1}
                disabled={disabled}
                type="button"
            >
                Продолжить
            </button>
            <a
                onClick={() => setState("login")}
                className="auth__toggle-button"
                type="button"
            >
                Войти в аккаунт
            </a>
        </motion.div>
    );
};

export default Step1Form;
