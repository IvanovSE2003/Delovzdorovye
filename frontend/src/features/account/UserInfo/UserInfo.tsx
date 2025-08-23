import './UserInfo.scss';

interface ProfileViewProps {
  user: {
    surname: string;
    name: string;
    patronymic: string;
    role: string;
    gender: string;
    dateBirth: string;
    phone: string;
    email: string;
  };
  anonym: boolean;
  getRoleName: () => string;
  getFormatDate: (date: string) => string;
  getFormatPhone: (phone: string) => string;
}

const UserInfo: React.FC<ProfileViewProps> = ({
  user,
  anonym,
  getRoleName,
  getFormatDate,
  getFormatPhone
}) => {
  return (
    <>
      <div>
        <div className="user-profile__fio">
          {anonym
            ? 'Анонимный пользователь'
            : <>{user.surname} {user.name} {user.patronymic}</>
          }
        </div>

        <div className='user-profile__role'>
          {getRoleName()}
        </div>
      </div>

      <div className="user-profile__main-info">
        <span><span className="label">Пол:</span> {user.gender}</span>
        <span><span className="label">Дата рождения:</span> {getFormatDate(user.dateBirth)}</span>
        <span><span className="label">Номер телефона:</span> {getFormatPhone(user.phone)}</span>
        <span><span className="label">E-mail:</span> {user.email}</span>
      </div>
    </>
  );
};

export default UserInfo;