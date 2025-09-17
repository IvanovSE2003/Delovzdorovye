import { useContext, useEffect, useState } from "react";
import AccountLayout from "../../AccountLayout";
import './Consultations.scss';
import UpcomingConsultations from "../../../../features/account/UpcomingConsultations/UpcomingConsultations";
import { Context } from "../../../../main";
import ArchiveConsultations from "../../../../features/account/ArchiveConsultations/ArchiveConsultations";
import { observer } from "mobx-react-lite";
import DoctorService from "../../../../services/DoctorService";
import { processError } from "../../../../helpers/processError";

const Consultations: React.FC = () => {
    const { store } = useContext(Context);
    const [doctorId, setDoctorId] = useState<number | null>(null);

    // Получение данных о докторе (id)
    const fecthDoctorId = async () => {
        try {
            const response = await DoctorService.getDoctorInfo(store.user.id);
            setDoctorId(response.data.id)
        } catch (e) {
            processError(e, "Ошибка при получение данные о докторе")
        }
    }

    // Получение данных при открыти страницы
    useEffect(() => {
        fecthDoctorId();
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