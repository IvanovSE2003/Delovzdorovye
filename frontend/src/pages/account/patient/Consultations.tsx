import { useContext } from "react";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";

import AccountLayout from "../AccountLayout";
import ArchiveConsultations from "../../../features/account/ArchiveConsultations/ArchiveConsultations";
import UpcomingConsultations from "../../../features/account/UpcomingConsultations/UpcomingConsultations";

const Consultations: React.FC = () => {
    const { store } = useContext(Context);
    return (
        <AccountLayout>
            <div className="consultations-doctor__main-title">Консультации</div>
            <div className="consultations">
                <h2 className="consultations__title">Предстоящие консультации</h2>
                <UpcomingConsultations
                    userId={store.user.id} // Получает свои консультации
                    userRole={store.user.role}
                    linkerId={store.user.id} // Смотрит свои консультации
                    linkerRole={store.user.role}
                />
                <br />
                <br />

                <h2 className="consultations__title">Архив консультаций</h2>
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