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
            <div className="page-container consultations">
                <div className="page-container__title">Консультации</div>

                <h2 className="consultations__title">Предстоящие консультации</h2>
                <UpcomingConsultations
                    id={store.user.id.toString()}
                    mode={"PATIENT"}
                />

                <h2 className="consultations__title">Архив консультации</h2>
                <ArchiveConsultations
                    id={store.user.id.toString()}
                    mode={"PATIENT"}
                />
            </div>
        </AccountLayout>
    )
}

export default observer(Consultations);