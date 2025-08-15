import { RouteNames } from "../../routes";
// import './AdminPage.scss';
import AccountLayout from "./AccountLayout";

const AdminPage = () => {
    const menuItemsAdmin =
        [
            { path: RouteNames.MAIN, name: 'Главная' },
            { path: RouteNames.MAIN, name: 'Специалисты' },
            { path: RouteNames.MAIN, name: 'Пользователи' },
        ]

    return (
        <AccountLayout menuItems={menuItemsAdmin}>
            <div className='patient-page'>
                <div className="admin-page">
                    <h3 className="admin-page__title">Редактирование профилей</h3>
                    <table className="admin-page__table">
                        <thead>
                            <tr>
                                <th>Специалист</th>
                                <th>Поле</th>
                                <th>Старое значение</th>
                                <th>Новое значение</th>
                                <th>Статус</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr id="12345">
                                <td>Иванова Мария Петровна<br />ID: 12345</td>
                                <td>Фамилия</td>
                                <td>Иванова</td>
                                <td>Петрова</td>
                                <td className="comfirm">Подтвердить</td>
                                <td className="reject">Отклонить</td>
                            </tr>
                            <tr id="12367">
                                <td>Сидорова Мария Ивановна<br />ID: 12367</td>
                                <td>Фото</td>
                                <td>Файл</td>
                                <td>Файл</td>
                                <td className="comfirm">Подтвердить</td>
                                <td className="reject">Отклонить</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AccountLayout>
    )
}

export default AdminPage;