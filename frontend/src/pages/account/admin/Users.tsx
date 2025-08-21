import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main";
import type { User } from "../../../models/Auth";
import { URL } from "../../../http";
import { observer } from "mobx-react-lite";
import AccountLayout from "../AccountLayout";

const Users = () => {
  const { store } = useContext(Context);
  const [users, setUsers] = useState<User[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    getAllUsers();
  }, [])

  const getAllUsers = async () => {
    const data = await store.getUsersAll();
    setUsers(data);
  }

  const handleImageHover = (e: React.MouseEvent, imgPath: string) => {
    setPreviewImage(`${URL}/${imgPath}`);
    setPreviewPosition({ x: e.clientX, y: e.clientY });
  };

  const handleImageLeave = () => {
    setPreviewImage(null);
  };

  const blockedOrUnblocked = async (id: number, isBlocked: boolean, role: string) => {
    if (role === "ADMIN") return;

    !isBlocked
      ? await store.blockUser(id)
      : await store.unblockUser(id);

    getAllUsers();
  }

  const changeRoleUser = async (id: number, role: string) => {
    if (role === "ADMIN") return;

    let data;
    if (role === "DOCTOR") {
      data = await store.changeRoleUser(id, "PATIENT");
    } else {
      data = await store.changeRoleUser(id, "DOCTOR");
    }
    console.log(data);
    getAllUsers();
  }

  const isActionAllowed = (role: string) => {
    return role !== "ADMIN";
  }

  return (
    <AccountLayout>
      <h1 className="tab">Профили</h1>
      <div className="admin-page">
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
              <th>Специализация</th>
              <th>Диплом</th>
              <th>Лицензия</th>
              <th>Статус</th>
              <th>Блокировка</th>
            </tr>
          </thead>

          <tbody className="users__table-body">
            {users ? users.map((user) => (
              <tr key={user.phone} className={`users__table-row ${user.isBlocked ? "users__row-blocked" : ""}`}>
                <td>
                  {user.role === "ADMIN" && "Админ"}
                  {user.role === "DOCTOR" && "Доктор"}
                  {user.role === "PATIENT" && "Пациент"}
                </td>
                <td>
                  <a href={`/profile/${user.id}`}>
                    {(user.name && user.surname && user.patronymic)
                      ? <div> {user.name} {user.surname} {user.patronymic} </div>
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
                <td>{user.gender}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.specialization || "-"}</td>
                <td>{user.diploma || "-"}</td>
                <td>{user.license || "-"}</td>
                <td
                  onClick={() => isActionAllowed(user.role) && changeRoleUser(user.id, user.role)}
                  className={isActionAllowed(user.role) ? "clickable" : "non-clickable"}
                >
                  {user.role === "DOCTOR" && "Сделать пациентом"}
                  {user.role === "PATIENT" && "Сделать доктором"}
                  {user.role === "ADMIN" && "-"}
                </td>
                <td
                  onClick={() => isActionAllowed(user.role) && blockedOrUnblocked(user.id, user.isBlocked, user.role)}
                  className={`${user.isBlocked ? "action-unblock-user" : "action-block-user"} ${isActionAllowed(user.role) ? "clickable" : "non-clickable"}`}
                >
                  {user.isBlocked ? "Разблокировать" : "Заблокировать"}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={10}>Нет данных</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AccountLayout>
  );
};

export default observer(Users);