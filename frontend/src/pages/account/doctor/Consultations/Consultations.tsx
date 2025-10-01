import { useContext } from "react";
import AccountLayout from "../../AccountLayout";
import './Consultations.scss';
import UpcomingConsultations from "../../../../features/account/UpcomingConsultations/UpcomingConsultations";
import { Context } from "../../../../main";
import ArchiveConsultations from "../../../../features/account/ArchiveConsultations/ArchiveConsultations";
import { observer } from "mobx-react-lite";

const Consultations: React.FC = () => {
    const { store } = useContext(Context);
    return (
        <AccountLayout>
            <div className="page-container consultations-doctor">
                <h1 className="page-container__title">Консультации</h1>
                <h2 className="consultations-doctor__title">Предстоящие консультации</h2>
                <UpcomingConsultations
                    id={store.user.id}
                    mode={store.user.role}
                />

                <h2 className="consultations-doctor__title">Архив консультации</h2>
                <ArchiveConsultations
                    id={store.user.id}
                    mode={store.user.role}
                />
            </div>
        </AccountLayout>
    )
}

export default observer(Consultations);