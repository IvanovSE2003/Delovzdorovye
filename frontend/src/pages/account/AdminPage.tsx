import { useContext } from "react";
import { useNavigate } from "react-router";
import { Context } from "../../main";
import { RouteNames } from "../../routes";
import { observer } from "mobx-react-lite";


const AdminPage = () => {
    const navigate = useNavigate();
    const { store } = useContext(Context);
    
    const logout = async () => {
        await store.logout();
        navigate(RouteNames.MAIN);
    }

    return (
        <div>
            Это главная страница АДМИНА
            <button onClick={logout} className="auth__button">Выйти</button>
        </div>
    )
}

export default observer(AdminPage);