import { URL } from "../../../http/index.js";
import "./UserAvatar.scss";

interface UserAvatarProps {
  img: string;
  isEditing: boolean;
  anonym: boolean;
  onAddPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  img,
  isEditing,
  anonym,
  onAddPhoto,
  onRemovePhoto
}) => {
  return (
    <div className="user-profile__avatar-content">
      <div className="user-profile__avatar">
        <img src={`${URL}/${img}`} alt="avatar-delovzdorovye" />
      </div>
      {isEditing && !anonym && (
        <div className="user-profile__links">
          <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
            <p>Добавить фото</p>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onAddPhoto}
            />
          </label>
          <p onClick={onRemovePhoto}>Удалить фото</p>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;