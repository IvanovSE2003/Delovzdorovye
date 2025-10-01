import { useState } from "react";
import type { Gender, IUserDataProfile, Role } from "../../../models/Auth";
import { URL } from "../../../http";


interface UserProfileEditProps {
    profileData: IUserDataProfile;
    onAddPhoto: (e: React.ChangeEvent<HTMLInputElement>, changePhoto: (img: string) => void) => void;
    onRemovePhoto: (changePhoto: (img: string) => void) => void;
    onSave: (ProfileData: IUserDataProfile) => void;
    onCancel: () => void;
    role: Role;
}

const UserProfileEdit: React.FC<UserProfileEditProps> = ({
    profileData,
    onAddPhoto,
    onRemovePhoto,
    onSave,
    onCancel,
    role
}) => {
    const [profileEditData, SetProfileEditData] = useState<IUserDataProfile>(profileData);
    const [error, setError] = useState<string | null>(null);

    const handleChangeProfileData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        SetProfileEditData(prev => ({
            ...prev,
            [name]: name === 'gender' ? (newValue as Gender) : newValue
        }));
    };

    const formatDateToDisplay = (date: string): string => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const [year, month, day] = date.split("-");
            return `${day}.${month}.${year}`;
        }
        return date;
    };

    const formatDateToISO = (date: string): string => {
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
            const [day, month, year] = date.split(".");
            return `${year}-${month}-${day}`;
        }
        return date;
    };

    const [localDate, setLocalDate] = useState<string>(
        profileData.dateBirth
            ? formatDateToDisplay(profileData.dateBirth)
            : ""
    );

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value.replace(/\D/g, '');
        let formatted = '';

        if (raw.length > 0) {
            formatted = raw.substring(0, 2);
            if (raw.length > 2) {
                formatted += '.' + raw.substring(2, 4);
            }
            if (raw.length > 4) {
                formatted += '.' + raw.substring(4, 8);
            }
        }

        setLocalDate(formatted);

        if (/^\d{2}\.\d{2}\.\d{4}$/.test(formatted)) {
            const [day, month, year] = formatted.split('.').map(Number);
            const date = new Date(year, month - 1, day);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const minDate = new Date();
            minDate.setFullYear(today.getFullYear() - 18);
            minDate.setHours(0, 0, 0, 0);

            const maxDate = new Date();
            maxDate.setFullYear(today.getFullYear() - 100);
            maxDate.setHours(0, 0, 0, 0);

            const isValid =
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day;

            if (!isValid) {
                setError("Некорректная дата (день.месяц.год)");
            } else if (date > today) {
                setError("Дата рождения не может быть в будущем :)");
            } else if (date > minDate) {
                setError("Возраст должен быть не менее 18 лет");
            } else if (date < maxDate) {
                setError("Возраст не может быть более 100 лет");
            } else {
                setError(null);
            }
        } else {
            setError(null);
        }

        SetProfileEditData(prev => ({ ...prev, dateBirth: formatDateToISO(formatted) }))
    };

    const changePhoto = (img: string) => {
        SetProfileEditData(prev => ({
            ...prev,
            img
        }))
    }

    return (
        <>
            {role !== "ADMIN" && (
                <div className="user-profile__avatar-content">
                    <div className="user-profile__avatar">
                        <img src={`${URL}/${profileData.img}`} alt="avatar-delovzdorovye" />
                    </div>
                    {!profileEditData.isAnonymous && (
                        <div className="user-profile__links">
                            <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                                <p>Добавить фото</p>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept=".png,.jpeg,.jpg"
                                    style={{ display: 'none' }}
                                    onChange={(e) => onAddPhoto(e, changePhoto)}
                                />
                            </label>
                            <p onClick={() => onRemovePhoto(changePhoto)}>Удалить фото</p>
                        </div>
                    )}
                </div>
            )}

            <div className="edit-form">
                {profileEditData.role === "PATIENT" && (
                    <div className="edit-form__anonym">
                        <input
                            type="checkbox"
                            name="isAnonymous"
                            value="isAnonymous"
                            checked={profileEditData.isAnonymous}
                            onChange={handleChangeProfileData}
                        />
                        <span>Анонимный пользователь</span>
                    </div>
                )}

                {!profileEditData.isAnonymous && (
                    <>
                        <div className="edit-form__group">
                            <input
                                type="text"
                                name="surname"
                                value={profileEditData.surname}
                                onChange={handleChangeProfileData}
                                placeholder="Фамилия"
                                title="Фамилия"
                            />
                        </div>

                        <div className="edit-form__group">
                            <input
                                type="text"
                                name="name"
                                value={profileEditData.name}
                                onChange={handleChangeProfileData}
                                placeholder="Имя"
                                title="Имя"
                            />
                        </div>

                        <div className="edit-form__group">
                            <input
                                type="text"
                                name="patronymic"
                                value={profileEditData.patronymic || ""}
                                onChange={handleChangeProfileData}
                                placeholder="Отчество"
                                title="Отчество"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '4px 0' }}>
                            <div className="auth__radio-btn">
                                <input
                                    id="male"
                                    type="radio"
                                    name="gender"
                                    value="Мужчина"
                                    checked={profileEditData.gender === "Мужчина"}
                                    title="Пол"
                                    onChange={handleChangeProfileData}
                                />
                                <label htmlFor="male">Мужчина</label>
                            </div>

                            <div className="auth__radio-btn">
                                <input
                                    id="female"
                                    type="radio"
                                    name="gender"
                                    value="Женщина"
                                    title="Пол"
                                    checked={profileEditData.gender === "Женщина"}
                                    onChange={handleChangeProfileData}
                                />
                                <label htmlFor="female">Женщина</label>
                            </div>
                        </div>

                        <div className="edit-form__group">
                            <input
                                type="text"
                                name="dateBirth"
                                title="Дата рождения"
                                placeholder="дд.мм.гггг"
                                value={localDate}
                                onChange={handleDateChange}
                                className={error ? "edit-form__group__input-error" : ""}
                            />
                            {error && <div className="edit-form__group__error">{error}</div>}
                        </div>
                    </>
                )}

                <div className="edit-form__group">
                    <input
                        type="tel"
                        name="phone"
                        value={profileEditData.phone}
                        onChange={handleChangeProfileData}
                        placeholder="Номер телефона"
                        title="Нельзя редактировать"
                        readOnly
                    />
                </div>

                <div className="edit-form__group">
                    <input
                        type="email"
                        name="email"
                        value={profileEditData.email}
                        onChange={handleChangeProfileData}
                        placeholder="Email"
                        title="Нельзя редактировать"
                        readOnly
                    />
                </div>

                <div className="user-profile__buttons">
                    <button className="my-button width100" onClick={() => onSave(profileEditData)}>Сохранить</button>
                    <button className="neg-button width100" onClick={onCancel}>Отмена</button>
                </div>
            </div>
        </>
    )
}

export default UserProfileEdit;