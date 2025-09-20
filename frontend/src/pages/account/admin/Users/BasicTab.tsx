import { useState } from "react";
import Search from "../../../../components/UI/Search/Search";
import Tabs from "../../../../components/UI/Tabs/Tabs";
import type { User } from "../../../../models/Auth";
import { URL } from "../../../../http";

interface BasicTabProps {
  filteredUsers: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  onBlockUser: (id: number, isBlocked: boolean, role: string) => void;
  onChangeRole: (id: number, role: string) => void;
}

const BasicTab: React.FC<BasicTabProps> = ({
  filteredUsers,
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  onBlockUser,
  onChangeRole
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  const handleImageHover = (e: React.MouseEvent, imgPath: string) => {
    setPreviewImage(`${URL}/${imgPath}`);
    setPreviewPosition({ x: e.clientX, y: e.clientY });
  };

  const handleImageLeave = () => {
    setPreviewImage(null);
  };

  const isActionAllowed = (role: string) => {
    return role !== "ADMIN";
  };

  const changeRoleClick = (id: number, role: string) => {
    if(role === "ADMIN") return;
    const result = confirm("Вы действительно хотите поменять роль выбранному пользователю?");
    if(!result) return;
    onChangeRole(id, role);
  }

  const blockedClick = (id: number, isBlocked: boolean, role: string) => {
    if(role === "ADMIN") return;
    const result = confirm(`Вы действительно хотите ${isBlocked ? "разблокировать" : "заблокировать"} пользователя?`);
    if(!result) return;
    onBlockUser(id, isBlocked, role);
  }

  return (
    <>
      <Search
        placeholder="Поиск по имени, фамилии и отчеству пользователя"
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

      {previewImage && (
        <div
          className="image-preview"
          style={{
            left: `${previewPosition.x + 20}px`,
            top: `${previewPosition.y + 20}px`,
          }}
        >
          <img src={previewImage} alt="Preview" />
        </div>
      )}

      <table className="admin-page__table">
        <thead>
          <tr>
            <th>Роль</th>
            <th>ФИО</th>
            <th>Фото</th>
            <th>Пол</th>
            <th>Номер телефона</th>
            <th>Email</th>
            <th>Статус</th>
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
                  {(user.name && user.surname && user.patronymic)
                    ? <div> {user.surname} {user.name} {user.patronymic} </div>
                    : <div> Анонимный пользователь </div>
                  }
                </a>
              </td>
              <td>
                {user.img ? (
                  <a
                    href={`${URL}/${user.img}`}
                    onMouseEnter={(e) => handleImageHover(e, user.img)}
                    onMouseLeave={handleImageLeave}
                    onMouseMove={(e) => setPreviewPosition({ x: e.clientX, y: e.clientY })}
                  >
                    Документ
                  </a>
                ) : 'Нет фото'}
              </td>
              <td>{user.gender || "Не указано"}</td>
              <td>{user.phone}</td>
              <td>{user.email}</td>
              <td
                onClick={() => changeRoleClick(user.id, user.role)}
                className={isActionAllowed(user.role) ? "clickable" : "non-clickable"}
              >
                {user.role === "DOCTOR" && "Сделать пациентом"}
                {user.role === "PATIENT" && "Сделать доктором"}
                {user.role === "ADMIN" && "-"}
              </td>
              {user.role === "ADMIN" ? (
                <td>-</td>
              ) : (
                <td
                  onClick={() => blockedClick(user.id, user.isBlocked, user.role)}
                  className={`${user.isBlocked ? "action-unblock-user" : "action-block-user"} ${isActionAllowed(user.role) ? "clickable" : "non-clickable"}`}
                >
                  {user.isBlocked ? "Разблокировать" : "Заблокировать"}
                </td>
              )}
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
    </>
  );
};

export default BasicTab;