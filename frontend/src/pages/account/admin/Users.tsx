import { menuItemsAdmin } from "../../../routes";
import AccountLayout from "../AccountLayout";

interface User {
  id: number;
  role: string;
  name: string;
  photo: string;
  gender: string;
  phone: string;
  email: string;
  specialization: string;
  diploma: string;
  license: string;
  status: string;
  isBlocked: boolean;
}

const Users = () => {
  const users: User[] = [
    {
      id: 1,
      role: "Специалист",
      name: "Иванова Мария Ивановна",
      photo: "Документ",
      gender: "Женщина",
      phone: "8 868 888 88 88",
      email: "homevo@mail.ru",
      specialization: "Нутрициолог",
      diploma: "Документ",
      license: "Документ",
      status: "Врем.",
      isBlocked: false,
    },
    {
      id: 2,
      role: "Пользователь",
      name: "Иванов Иван Иванович",
      photo: "Документ",
      gender: "Мужчина",
      phone: "8 868 888 88 88",
      email: "homev@mail.ru",
      specialization: "-",
      diploma: "-",
      license: "-",
      status: "Врем.",
      isBlocked: false,
    },
  ];

  const handleToggleBlock = (userId: number) => {
    console.log(`Toggling block for user ${userId}`);
  };

  return (
    <AccountLayout menuItems={menuItemsAdmin}>
      <h1 className="tab">Профили</h1>
      <div className="admin-page">
        <table className="admin-page__table">
          <thead>
            <tr>
              <th>Роль</th>
              <th>ФИО</th>
              <th>Фото</th>
              <th>Пол</th>
              <th>Номер телефона</th>
              <th>Email</th>
              <th>Специализация</th>
              <th>Диплом</th>
              <th>Лицензия</th>
              <th>Статус</th>
              <th>Блокировка</th>
            </tr>
          </thead>

          <tbody className="users__table-body">
            {users.map((user) => (
              <tr key={user.id} className="users__table-row">
                <td>{user.role}</td>
                <td>{user.name}</td>
                <td>{user.photo}</td>
                <td>{user.gender}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.specialization}</td>
                <td>{user.diploma}</td>
                <td>{user.license}</td>
                <td>{user.status}</td>
                <td>Заблокировать</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountLayout>
  );
};

export default Users;