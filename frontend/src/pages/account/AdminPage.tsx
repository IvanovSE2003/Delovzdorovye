import { useContext, useState } from "react";
import { Context } from "../../main";
import '../../features/account/MyProfile/MyProfile.scss';
import { observer } from "mobx-react-lite";
import UserProfile from "../../features/account/MyProfile/UserProfile";


const AdminPage: React.FC = () => {
    const { store } = useContext(Context);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    return (
        <div className="user-profile">
            <div className="user-profile__box">
                {isEditing ? (
                    <UserProfile
                        profileData={store.user}
                        isAvatar={false}
                        onEdit={() => setIsEditing(true)}
                        onLogout={async () => { await store.logout() }}
                    />
                ) : (
                    <UserProfile
                        profileData={store.user}
                        isAvatar={false}
                        onEdit={() => setIsEditing(true)}
                        onLogout={async () => { await store.logout() }}
                    />
                )}
            </div>
        </div>
    )
}

export default observer(AdminPage);