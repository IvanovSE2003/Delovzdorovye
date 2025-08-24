import { useContext } from "react";
import { Context } from "../../main";
import UserInfo from "../../features/account/UserInfo/UserInfo";
import { useNavigate } from "react-router";
import { RouteNames } from "../../routes";
import '../../features/account/MyProfile/MyProfile.scss';


const AdminPage = () => {
    const navigate = useNavigate();
    const { store } = useContext(Context);


    const Logout = async () => {
        await store.logout();
        navigate(RouteNames.MAIN);
    };

    const GetFormatDate = (date: string) => {
        return date?.split('-').reverse().join('.');
    };

    const GetFormatPhone = (phone: string) => {
        return phone?.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
    };

    const getRoleName = () => {
        const Role = store.user.role;
        switch (Role) {
            case "PATIENT": return 'Пациент';
            case "DOCTOR": return 'Специалист';
            default: return 'Администратор';
        }
    };

    return (
        <div className="user-profile">
            <div className="user-profile__info">
                <UserInfo
                    user={store.user}
                    getRoleName={getRoleName}
                    getFormatDate={GetFormatDate}
                    getFormatPhone={GetFormatPhone}
                />

                <button
                    className="neg-button width100"
                    onClick={Logout}
                >
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    )
}

export default AdminPage;