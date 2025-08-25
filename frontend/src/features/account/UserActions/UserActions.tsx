import { observer } from "mobx-react-lite";

interface ProfileActionsProps {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onLogout: () => void;
}

const UserActions: React.FC<ProfileActionsProps> = ({
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onLogout
}) => {
  return (
    <div className="user-profile__buttons">
      {isEditing ? (
        <>
          <button className="my-button width100" onClick={onSave}>Сохранить</button>
          <button className="neg-button width100" onClick={onCancel}>Отмена</button>
        </>
      ) : (
        <>
          <button className="my-button width100" onClick={onEdit}>Редактировать</button>
          <button className="neg-button width100" onClick={onLogout}>Выйти из аккаунта</button>
        </>
      )}
    </div>
  );
};

export default observer(UserActions);