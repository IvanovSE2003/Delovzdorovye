import { useEffect, useState } from "react";
import AccountLayout from "../../AccountLayout";
import './Specialists.scss';
import { getTimeZoneLabel } from "../../../../models/TimeZones";
import DoctorService from "../../../../services/DoctorService";
import type { TypeResponse } from "../../../../models/response/DefaultResponse";
import type { AxiosError } from "axios";
import { URL } from "../../../../http";
import type { IDoctor } from "../../../../models/IDoctor";
import LoaderUsefulInfo from "../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

const Specialists: React.FC = () => {
    const [doctors, setDoctors] = useState<IDoctor[]>([]);
    const [expandedSpecializations, setExpandedSpecializations] = useState<{ [key: string]: boolean }>({});
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    const toggleSpecialization = (doctorId: number, specIndex: number) => {
        const key = `${doctorId}-${specIndex}`;
        setExpandedSpecializations(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const fetchSpecialists = async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const response = await DoctorService.getAllDoctors(page, limit);
            setDoctors(response.data.data);
            setPagination(response.data.pagination);
        } catch (e) {
            const error = e as AxiosError<TypeResponse>;
            console.error("Ошибка при получении специалистов: ", error.response?.data.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecialists(currentPage);
    }, [currentPage]);

    if(loading) return (
        <AccountLayout>
            <div className="page-container">
                <h1 className="consultations-doctor__main-title">Список специалистов</h1>
                <LoaderUsefulInfo/>
            </div>
        </AccountLayout>
    )

    return (
        <AccountLayout>
            <div className="page-container">
                <h1 className="consultations-doctor__main-title">Список специалистов</h1>
                <div className="specialists">
                    {doctors.length > 0 ? doctors.map((doctor) => (
                        <div key={doctor.id} className="specialist-card">
                            <div className="specialist-card__header">
                                <div className="specialist-card__avatar">
                                    <img
                                        src={doctor.user.img ? `${URL}/${doctor.user.img}` : '/default-avatar.png'}
                                        alt={`${doctor.user.surname} ${doctor.user.name}`}
                                    />
                                </div>

                                <div className="specialist-card__info">
                                    <h2 className="specialist-card__name">
                                        {doctor.user.surname} {doctor.user.name} {doctor.user?.patronymic}
                                    </h2>
                                    <p className="specialist-card__status">
                                        Часовой пояс: {getTimeZoneLabel(doctor.user.time_zone)}
                                    </p>
                                </div>
                            </div>

                            {doctor.profData && doctor.profData.length > 0 ? (
                                <div className="specialist-card__specializations">
                                    <h3 className="specialist-card__specializations-title">
                                        Специализации ({doctor.profData.length})
                                    </h3>

                                    {doctor.profData.map((spec, index) => (
                                        <div key={index} className="specialization-item">
                                            <button
                                                className="specialization-item__header"
                                                onClick={() => toggleSpecialization(doctor.id, index)}
                                            >
                                                <span className="specialization-item__name">
                                                    {spec.specialization}
                                                </span>
                                                <span className="specialization-item__arrow">
                                                    {expandedSpecializations[`${doctor.id}-${index}`] ? '▲' : '▼'}
                                                </span>
                                            </button>

                                            {expandedSpecializations[`${doctor.id}-${index}`] && (
                                                <div className="specialization-item__content">
                                                    <div className="specialization-docs">
                                                        <div className="specialization-docs__item">
                                                            <span className="specialization-docs__label">Диплом:</span>
                                                            <a
                                                                href={`${URL}/${spec.diploma}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="specialization-docs__link"
                                                            >
                                                                Посмотреть документ
                                                            </a>
                                                        </div>
                                                        <div className="specialization-docs__item">
                                                            <span className="specialization-docs__label">Лицензия:</span>
                                                            <a
                                                                href={`${URL}/${spec.license}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="specialization-docs__link"
                                                            >
                                                                Посмотреть документ
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="consultation__empty">Специализации не найдены</div>
                            )}
                        </div>
                    )) : (
                        <div>
                            <div className="consultation-card__icon">👤</div>
                            <div className="consultation-card__text-empty"> В системе пока нет ни одного специалиста</div>
                        </div>
                    )}
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="pagination">
                        <button
                            disabled={pagination.currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            Назад
                        </button>
                        <span>
                            Страница {pagination.currentPage} из {pagination.totalPages}
                        </span>
                        <button
                            disabled={pagination.currentPage === pagination.totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        >
                            Вперёд
                        </button>
                    </div>
                )}
            </div>
        </AccountLayout>
    );
};

export default Specialists;
