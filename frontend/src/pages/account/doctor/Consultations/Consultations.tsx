import { useContext, useEffect, useState } from "react";
import AccountLayout from "../../AccountLayout";
import './Consultations.scss';
import UpcomingConsultations from "../../../../features/account/UpcomingConsultations/UpcomingConsultations";
import { Context } from "../../../../main";
import ArchiveConsultations from "../../../../features/account/ArchiveConsultations/ArchiveConsultations";
import { observer } from "mobx-react-lite";

const Consultations: React.FC = () => {
    const { store } = useContext(Context);
    const [doctorId, setDoctorId] = useState<number | null>(null);

    const consoleDoc = async () => {
        const doctor = await store.getDoctorInfo(store.user.id);
        setDoctorId(doctor.id)
    }

    useEffect(() => {
        consoleDoc();
    }, [])

    return (
        <AccountLayout>
            <div className="page-container consultations-doctor">
                <h1 className="page-container__title">Консультации</h1>
                <h2 className="consultations-doctor__title">Предстоящие консультации</h2>
                <UpcomingConsultations
                    id={doctorId?.toString()}
                    mode={store.user.role}
                />

                <h2 className="consultations-doctor__title">Архив консультации</h2>
                <ArchiveConsultations
                    id={doctorId?.toString()}
                    mode={store.user.role}
                />
            </div>
        </AccountLayout>
    )
}

export default observer(Consultations);