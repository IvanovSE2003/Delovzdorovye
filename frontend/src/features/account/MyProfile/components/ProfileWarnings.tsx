import { useContext } from "react";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import './ProfileWarnings.scss'
import LoaderUsefulInfo from "../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";

const ProfileWarnings: React.FC = () => {
    const { store } = useContext(Context);

    if (store.loading) return (
        <div className="user-profile__warns">
            <LoaderUsefulInfo/>
        </div>
    )

    return (
        <>

            <div className="user-profile__warns">
                {store.user.sentChanges && (
                    <div className="user-profile__warn-block">
                        <span>Ваши изменения находятся на модерации. Изменения принимаются или отклоняются администратором.</span>
                    </div>
                )}
            </div>
        </>
    );
};

export default observer(ProfileWarnings);