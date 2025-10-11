import LoaderUsefulInfo from "../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";
import Search from "../../../../components/UI/Search/Search";
import Tabs from "../../../../components/UI/Tabs/Tabs";
import type { User } from "../../../../models/Auth";

interface BasicTabProps {
  filteredUsers: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRole: string | null;
  onRoleChange: (role: string) => void;
  loading: boolean;
}

const BasicTab: React.FC<BasicTabProps> = ({
  filteredUsers,
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  loading
}) => {
  if (loading) return (
    <>
      <Search
        placeholder="Поиск по ФИО, телефону, почте"
        value={searchTerm}
        onChange={onSearchChange}
      />

      <Tabs
        tabs={[
          { name: "ALL", label: "Все" },
          { name: "ADMIN", label: "Администраторы" },
          { name: "DOCTOR", label: "Специалисты" },
          { name: "PATIENT", label: "Пользователи" }
        ]}
        filter
        activeTab={selectedRole}
        onTabChange={onRoleChange}
        paramName="role"
        syncWithUrl={true}
      />

      <LoaderUsefulInfo/>
    </>
  )


  return (
    <>
      <Search
        placeholder="Поиск по ФИО, телефону, почте"
        value={searchTerm}
        onChange={onSearchChange}
      />

      <Tabs
        tabs={[
          { name: "ALL", label: "Все" },
          { name: "ADMIN", label: "Администраторы" },
          { name: "DOCTOR", label: "Специалисты" },
          { name: "PATIENT", label: "Пользователи" }
        ]}
        filter
        activeTab={selectedRole}
        onTabChange={onRoleChange}
        paramName="role"
        syncWithUrl={true}
      />

      {(selectedRole !== null || searchTerm !== "") && (
        <table className="admin-page__table">
          <thead>
            <tr>
              <th>Роль</th>
              <th>ФИО</th>
              <th>Номер телефона</th>
              <th>Email</th>
              <th>Блокировка</th>
            </tr>
          </thead>

          <tbody className="users__table-body">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr
                key={user.phone}
                className={`users__table-row ${user.isBlocked ? "users__row-blocked" : ""}
                ${user.role === 'PATIENT' && "users__row-patient"}
                ${user.role === 'DOCTOR' && "users__row-doctor"}
                ${user.role === 'ADMIN' && "users__row-admin"}`}
              >
                <td>
                  {user.role === "ADMIN" && "Администратор"}
                  {user.role === "DOCTOR" && "Специалист"}
                  {user.role === "PATIENT" && "Пользователь"}
                </td>
                <td>
                  <a href={`/profile/${user.id}`}>
                    {(user.name && user.surname)
                      ? <div> {user.surname} {user.name} {user.patronymic} </div>
                      : <div> Анонимный пользователь </div>
                    }
                  </a>
                </td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.isBlocked ? "Да" : "-"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={11}>
                  {searchTerm ? "Пользователи не найдены" : "Нет данных"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default BasicTab;