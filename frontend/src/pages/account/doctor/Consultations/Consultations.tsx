import { useContext, useEffect, useState } from "react";
import Search from "../../../../components/UI/Search/Search";
import AccountLayout from "../../AccountLayout";
import type { Consultation } from "../../../../features/account/UpcomingConsultations/UpcomingConsultations";
import ConsultationService from "../../../../services/ConsultationService";
import './Consultations.scss';
import { API_URL } from "../../../../http";
import UpcomingConsultations from "../../../../features/account/UpcomingConsultations/UpcomingConsultations";
import ArchiveConsultations from "../../admin/ArchiveConsultations/ArchiveConsultations";
import { Context } from "../../../../main";

const Consultations = () => {
    const { store } = useContext(Context);
    const [upcomingConsultations, setUpcomingConsultations] = useState<Consultation[]>([] as Consultation[]);
    const [archiveConsultations, setArchiveConsultations] = useState<Consultation[]>([] as Consultation[]);
    const [search, setSearch] = useState<string>("");

    // Загрузка предстоящий консультаций доктора
    const fetchUpcoming = async () => {
        const response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "UPCOMING" });
        setUpcomingConsultations(response.data.consultations);
    }

    // Загрузка архивных консультаций доктора
    const fetchArchive = async () => {
        const response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "ARCHIVE" });
        setArchiveConsultations(response.data.consultations);
    }

    // Загрузка данных при открытии страницы
    useEffect(() => {
        fetchUpcoming();
        fetchArchive();
    }, [])

    return (
        // <AccountLayout>
        //     <div className="consultations-doctor">
        //         <div className="consultations-doctor__upcoming">
        //             <h1 className="consultations-doctor__title">Предстоящие консультации</h1>
        //             <Search
        //                 placeholder="Поиск по фамилии, имени, отчеству"
        //                 value={search}
        //                 onChange={setSearch}
        //             />
        //             {upcomingConsultations ? upcomingConsultations.map(upcoming =>
        //                 <div key={upcoming.id} className="consultation-card">
        //                     id: {upcoming.id} {/*  Отладочная печать */}
        //                     <div className="consultation-card__time">
        //                         <span className="consultation-card__date">{upcoming.date}</span>
        //                         <span className="consultation-card__hours">{upcoming.durationTime}</span>
        //                     </div>

        //                     <div className="consultation-card__info">
        //                         <div className="consultation-card__specialist">
        //                             Специалист: <span>{upcoming.DoctorSurname} {upcoming.DoctorName} {upcoming?.DoctorPatronymic}</span>
        //                         </div>

        //                         <div className="consultation-card__symptoms">
        //                             {'Симптомы: '}
        //                             {upcoming.Problems.map((p, i) => (
        //                                 <span key={i}>
        //                                     {p.toLocaleLowerCase()}
        //                                     {i < upcoming.Problems.length - 1 ? ', ' : '.'}
        //                                 </span>
        //                             ))}
        //                         </div>

        //                         <div className="consultation-card__details">
        //                             Симптомы подробно: <span>{upcoming.other_problem ? upcoming?.other_problem : "Не указано"}</span>
        //                         </div>
        //                     </div>
        //                 </div>
        //             ) : (
        //                 <div className="consultations-doctor__none">Нет данных</div>
        //             )}
        //         </div>
        //         <div className="consultations-doctor__archive">
        //             <h1 className="consultations-doctor__title">Архив консультаций</h1>
        //             <Search
        //                 placeholder="Поиск по фамилии, имени, отчеству"
        //                 value={search}
        //                 onChange={setSearch}
        //             />
        //             {archiveConsultations.length > 0 ? archiveConsultations.map(archive =>
        //                 <div key={archive.id} className="archive-consultation-card">
        //                     <div className="archive-consultation-card__time">
        //                         <span className="archive-consultation-card__date">{archive.date}</span>
        //                         <span className="archive-consultation-card__hours">{archive.durationTime}</span>
        //                     </div>

        //                     <div className="archive-consultation-card__info">
        //                         <div className="archive-consultation-card__specialist">
        //                             Специалист: <span>{archive.DoctorSurname} {archive.DoctorName} {archive?.DoctorPatronymic}</span>
        //                         </div>

        //                         <div className="archive-consultation-card__symptoms">
        //                             Симптомы: <span>{archive.Problems}</span>
        //                         </div>

        //                         <div className="archive-consultation-card__details">
        //                             Симптомы подробно: <span>{archive.other_problem ? archive.other_problem : "Не указано"}</span>
        //                         </div>
        //                     </div>

        //                     <div className="archive-consultation-card__actions">
        //                         <div className="archive-consultation-card__recomendations">
        //                             {`Рекомендации: `}
        //                             {archive.recommendations ? (
        //                                 <a href={`${API_URL}/${archive.recommendations}`}>
        //                                     Файл
        //                                 </a>
        //                             ) : (
        //                                 "Файл не приложен"
        //                             )}
        //                         </div>
        //                     </div>

        //                     <div className="archive-consultation-card__divider"></div>
        //                 </div>
        //             ) : (
        //                 <div className="consultations-doctor__none">Нет архивных консультаций</div>
        //             )}
        //         </div>
        //     </div>
        // </AccountLayout>
        <AccountLayout>
            <div className="consultations">
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

export default Consultations;