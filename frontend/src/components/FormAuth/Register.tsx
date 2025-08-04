import React, { useContext, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import "../FormAuth/FormAuth.scss"
import { Context } from "../../main";
import type { AuthState } from "./FormAuth";
import MyInput from "../UI/MyInput/MyInput";

type Gender = "мужчина" | "женщина" | "";
type Role = "PACIENT" | "DOCTOR" | "ADMIN" | "";
interface UserDetails {
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    pin_code: string;
    password: string;
    time_zone: string;
    date_birth: string;
    gender: Gender;
    role: Role;
}

type RegisterProps = {
    setState: Dispatch<SetStateAction<AuthState>>;
};

const Register: React.FC<RegisterProps> = ({ setState }) => {
    const [userDetails, setUserDetails] = useState<UserDetails>({
        name: "",
        surname: "",
        patronymic: "",
        email: "",
        phone: "",
        pin_code: "",
        password: "",
        time_zone: "",
        date_birth: "",
        gender: "",
        role: ""
    });
    const [error, setError] = useState<string>("");
    const [replyPass, setReplyPass] = useState<string>("");
    const [step, setStep] = useState<number>(1);
    const { store } = useContext(Context);

    const handleSubmitDetails = (e: FormEvent): void => {
        e.preventDefault();

        if (replyPass !== userDetails.password) {
            setError("Пароли не совпадают!");
            return;
        }

        const isEmpty = Object.values(userDetails).some(
            (value) => !value || value.trim() === ""
        );
        if (isEmpty) {
            setError("Все поля должны быть заполнены!");
            return;
        }

        setError("");
        // store.registration(userDetails);

        // if (localStorage.getItem('token')) {
        //     window.location.href = '/personal';
        // }

        console.log("Регистрируем пользователя:", userDetails);
    };

    const handleBack = () => {
        setError("");
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleDetailsChange = (field: keyof UserDetails, value: string | Gender | Role): void => {
        setUserDetails((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            {step === 1 && (
                <div className="auth__form">
                    {error && <p className="auth__error">{error}</p>}

                    <MyInput
                        id="surname"
                        label="Фамилия"
                        value={userDetails.surname}
                        onChange={(value) => handleDetailsChange("surname", value)}
                        required
                    />

                    <MyInput
                        id="name"
                        label="Имя"
                        value={userDetails.name}
                        onChange={(value) => handleDetailsChange("name", value)}
                        required
                    />

                    <MyInput
                        id="patronymic"
                        label="Отчество"
                        value={userDetails.patronymic}
                        onChange={(value) => handleDetailsChange("patronymic", value)}
                        required
                    />

                    <MyInput
                        id="email"
                        label="Электронная почта"
                        value={userDetails.email}
                        onChange={(value) => handleDetailsChange("email", value)}
                        required
                    />

                    <MyInput
                        id="phone"
                        label="Телефон"
                        value={userDetails.phone}
                        maxLength={11}
                        onChange={(value) => handleDetailsChange("phone", value)}
                        required
                    />

                    <div className="radios">
                        <div className="form_radio_btn">
                            <input
                                id="male"
                                type="radio"
                                name="male"
                                value="мужчина"
                                checked={userDetails.gender === "мужчина"}
                                onChange={(e) => handleDetailsChange("gender", e.target.value)}
                            />
                            <label htmlFor="male">Мужчина</label>
                        </div>

                        <div className="form_radio_btn">
                            <input
                                id="female"
                                type="radio"
                                name="female"
                                value="женщина"
                                checked={userDetails.gender === "женщина"}
                                onChange={(e) => handleDetailsChange("gender", e.target.value)}
                            />
                            <label htmlFor="female">Женщина</label>
                        </div>
                    </div>

                    <MyInput
                        type="date"
                        id="date_birth"
                        label="Дата рождения"
                        value={userDetails.date_birth}
                        onChange={(value) => handleDetailsChange("date_birth", value)}
                        required
                    />

                    <div className="input-group">
                        <select
                            value={userDetails.time_zone}
                            onChange={(e) => handleDetailsChange("time_zone", e.target.value)}
                            className="auth__input"
                            required
                        >
                            <option value="">Выбрать</option>
                            <option value="0">-1 МСК</option>
                            <option value="1">МСК</option>
                            <option value="2">+1 МСК</option>
                            <option value="3">+2 МСК</option>
                            <option value="4">+3 МСК</option>
                            <option value="5">+4 МСК</option>
                            <option value="6">+5 МСК</option>
                            <option value="7">+6 МСК</option>
                            <option value="8">+7 МСК</option>
                            <option value="9">+8 МСК</option>
                            <option value="10">+9 МСК</option>
                        </select>
                        <label>Часовой пояс</label>
                    </div>

                    <button className="auth__button" onClick={() => setStep(2)}>
                        Продолжить
                    </button>
                    <a onClick={() => setState("login")} className="auth__toggle-button">
                        Войти в аккаунт
                    </a>
                </div>
            )}

            {step === 2 && (
                <div className="role-selection auth__form">
                    {error && <p className="auth__error">{error}</p>}

                    <div className="role-selection__cards">
                        <div className="role-card role-card_doctor">
                            <div className="role-card__icon">👨‍⚕️</div>
                            <h3 className="role-card__title">Доктор</h3>
                            <p className="role-card__description">
                                Я медицинский специалист и хочу помогать пациентам
                            </p>
                            <button
                                className="role-card__button"
                                onClick={() => {
                                    handleDetailsChange("role", "DOCTOR")
                                    setStep(3);
                                }}
                            >
                                Выбрать
                            </button>
                        </div>

                        <div className="role-card role-card_patient">
                            <div className="role-card__icon">👤</div>
                            <h3 className="role-card__title">Пациент</h3>
                            <p className="role-card__description">
                                Я ищу медицинскую помощь или консультацию
                            </p>
                            <button
                                className="role-card__button"
                                onClick={() => {
                                    handleDetailsChange("role", "PACIENT")
                                    setStep(3);
                                }}
                            >
                                Выбрать
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleBack}
                        className="auth__button"
                    >
                        Назад
                    </button>
                </div>
            )}

            {step === 3 && (
                <form onSubmit={handleSubmitDetails} className="auth__form">
                    {error && <p className="auth__error">{error}</p>}

                    <MyInput
                        id="pin_code"
                        label="Пин-код"
                        value={userDetails.pin_code}
                        maxLength={4}
                        onChange={(value) => handleDetailsChange("pin_code", value)}
                        required
                    />

                    <MyInput
                        type="password"
                        id="password"
                        label="Пароль"
                        value={userDetails.password}
                        onChange={(value) => handleDetailsChange("password", value)}
                        required
                    />

                    <MyInput
                        type="password"
                        id="repeat-password"
                        label="Повторите пароль"
                        value={replyPass}
                        onChange={(value) => setReplyPass(value)}
                        required
                    />

                    <button type="submit"
                        className="auth__button__final"
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
                </form>
            )}
        </div>
    );
};

export default Register;