import '../../features/account/MyProfile/MyProfile.scss';
import { observer } from "mobx-react-lite";
import MyProfile from "../../features/account/MyProfile/MyProfile";


const AdminPage: React.FC = () => {
    return (
        <MyProfile
            mode={'ADMIN'}
        />
    )
}

export default observer(AdminPage);