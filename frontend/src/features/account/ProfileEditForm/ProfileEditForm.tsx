import { observer } from "mobx-react-lite";
import type { Gender, IUserDataProfile } from "../../../models/Auth.js";
import './ProfileEditForm.scss';

interface ProfileEditFormProps {
  formData: IUserDataProfile;
  anonym: boolean;
  userRole: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onGenderChange: (gender: Gender) => void;
  onAnonymChange: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  formData,
  anonym,
  userRole,
  onInputChange,
  onGenderChange,
  onAnonymChange
}) => {
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
              type="date"
              name="dateBirth"
              title="Дата рождения"
              placeholder="дд.мм.гггг"
              value={formData.dateBirth}
              onChange={onInputChange}
            />
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