import { useContext, useEffect, useState } from "react";
import { menuItemsAdmin } from "../../../routes";
import AccountLayout from "../AccountLayout";
import { Context } from "../../../main";
import type { User } from "../../../models/Auth";
import { URL } from "../../../http";

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
    console.log(data);
  }

  const handleToggleBlock = (userId: number) => {
    console.log(`Toggling block for user ${userId}`);
  };

  const handleImageHover = (e: React.MouseEvent, imgPath: string) => {
    setPreviewImage(`${URL}/${imgPath}`);
    setPreviewPosition({ x: e.clientX, y: e.clientY });
  };

  const handleImageLeave = () => {
    setPreviewImage(null);
  };

  const blockedOrUnblocked = async (id: number, isBlocked: boolean) => {
    if (!isBlocked) {
      const data = await store.blockUser(id);
      console.log(data);
    } else {
      const data = await store.unblockUser(id);
      console.log(data);
    }
    getAllUsers();
  }

  return (
    <AccountLayout menuItems={menuItemsAdmin}>
      <h1 className="tab">Профили</h1>
      <div className="admin-page">
        {previewImage && (
          <div
            className="image-preview"
            style={{
              position: 'fixed',
              left: `${previewPosition.x + 20}px`,
              top: `${previewPosition.y + 20}px`,
              zIndex: 1000,
              backgroundColor: 'white',
              padding: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: '200px',
                maxHeight: '200px'
              }}
            />
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
                  {user.role === 'DOCTOR'
                    ? 'Доктор'
                    : 'Пациент'
                  }
                </td>
                <td>
                  {(user.name && user.surname && user.patronymic)
                    ? (<div>{user.name} {user.surname} {user.patronymic}</div>)
                    : (<div>Анонимный пользователь</div>)
                  }
                </td>
                <td>
                  {user.img ? (
                    <a
                      href={`${URL}/${user.img}`}
                      onMouseEnter={(e) => handleImageHover(e, user.img)}
                      onMouseLeave={handleImageLeave}
                      onMouseMove={(e) => setPreviewPosition({ x: e.clientX, y: e.clientY })}
                    >
                      Изображение
                    </a>
                  ) : 'Нет фото'}
                </td>
                <td>{user.gender}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.specialization || "-"}</td>
                <td>{user.diploma || "-"}</td>
                <td>{user.license || "-"}</td>
                <td>Сменить роль</td>
                <td
                  onClick={() => blockedOrUnblocked(user.id, user.isBlocked)}
                  className={user.isBlocked ? "action-unblock-user" : "action-block-user"}
                >
                  {user.isBlocked ? "Разблокировать" : "Заблокировать"}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={10}>Нет данных</td>
              </tr>
            )

            }
          </tbody>
        </table>
      </div>
    </AccountLayout>
  );
};

export default Users;