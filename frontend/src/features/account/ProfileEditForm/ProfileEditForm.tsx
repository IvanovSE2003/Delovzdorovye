import { observer } from "mobx-react-lite";
import type { Gender, IUserDataProfile } from "../../../models/Auth.js";
import './ProfileEditForm.scss';
import { useState } from "react";

interface ProfileEditFormProps {
  formData: IUserDataProfile;
  anonym: boolean;
  userRole: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onInputChangeValue?: (value: string) => void;
  onGenderChange: (gender: Gender) => void;
  onAnonymChange: () => void;
  onDateChange: (value: string) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  formData,
  anonym,
  userRole,
  onInputChange,
  onGenderChange,
  onAnonymChange,
  onDateChange
}) => {
  const [error, setError] = useState<string | null>(null);

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
    formData.dateBirth 
      ? formatDateToDisplay(formData.dateBirth)
      : ""
  );


  const formatDateToInput = (isoDate?: string) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}.${year}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    let formatted = '';

    // Форматируем ДД.ММ.ГГГГ
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

    // Валидация при полной дате
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

    onDateChange(formatDateToISO(formatted));
  };

  return (
    <div className="edit-form">
      {userRole === "PATIENT" && (
        <div className="edit-form__anonym">
          <input
            type="checkbox"
            name="anonym"
            value="anonym"
            defaultChecked={anonym}
            onClick={onAnonymChange}
          />
          <span>Анонимный пользователь</span>
        </div>
      )}

      {!anonym && (
        <>
          <div className="edit-form__group">
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={onInputChange}
              placeholder="Фамилия"
              title="Фамилия"
            />
          </div>

          <div className="edit-form__group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Имя"
              title="Имя"
            />
          </div>

          <div className="edit-form__group">
            <input
              type="text"
              name="patronymic"
              value={formData.patronymic || ""}
              onChange={onInputChange}
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
                value="мужчина"
                checked={formData.gender === "Мужчина"}
                title="Пол"
                onChange={() => onGenderChange("Мужчина")}
              />
              <label htmlFor="male">Мужчина</label>
            </div>

            <div className="auth__radio-btn">
              <input
                id="female"
                type="radio"
                name="gender"
                value="женщина"
                title="Пол"
                checked={formData.gender === "Женщина"}
                onChange={() => onGenderChange("Женщина")}
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
          value={formData.phone}
          onChange={onInputChange}
          placeholder="Номер телефона"
          title="Нельзя редактировать"
          readOnly
        />
      </div>

      <div className="edit-form__group">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          placeholder="Email"
          title="Нельзя редактировать"
          readOnly
        />
      </div>
    </div>
  );
};

export default observer(ProfileEditForm);