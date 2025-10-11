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
            <div>
                <h1 className="consultations-doctor__main-title">Консультации</h1>
                <h2 className="consultations-doctor__title">Предстоящие консультации</h2>
                <UpcomingConsultations
                    userId={store.user.id}
                    userRole={store.user.role}
                    linkerId={store.user.id}
                    linkerRole={store.user.role}
                />

                <h2 className="consultations-doctor__title">Архив консультаций</h2>
                <ArchiveConsultations
                    userId={store.user.id}
                    userRole={store.user.role}
                    linkerRole={store.user.role}
                />
            </div>
        </AccountLayout>
    )
}

export default observer(Consultations);