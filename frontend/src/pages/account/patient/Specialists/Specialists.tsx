import { useEffect, useState } from "react";
import $api, { API_URL, URL } from "../../../../http";
import AccountLayout from "../../AccountLayout";
import './Specialists.scss';

interface Specialization {
    specialization: string;
    diploma: string;
    license: string;
}

interface UserDoctor {
    id: number;
    name: string;
    surname: string;
    patronymic?: string;
}

export interface IDoctor {
    id: number;
    experienceYears: number;
    isActivated: boolean;
    profData: Specialization[];
    user: UserDoctor;
    userAvatar?: string;
}

const Specialists: React.FC = () => {
    const [doctors, setDoctors] = useState<IDoctor[]>([]);
    const [expandedSpecializations, setExpandedSpecializations] = useState<{ [key: string]: boolean }>({});

    const toggleSpecialization = (doctorId: number, specIndex: number) => {
        const key = `${doctorId}-${specIndex}`;
        setExpandedSpecializations(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    useEffect(() => {
        $api.get(`${API_URL}/doctor/all`)
            .then(response => {
                setDoctors(response.data.data);
            })
            .catch(error => {
                if (error.response) {
                    console.error('Ошибка сервера:', error.response.status);
                    throw new Error("Ошибка при загрузке специалистов!");
                }
            });
    }, []);

    return (
        <AccountLayout>
            <div className="page-container">
                <h1 className="page-container__title">Список специалистов</h1>
                <div className="specialists">
                    {doctors.map((doctor) => (
                        <div key={doctor.id} className="specialist-card">
                            <div className="specialist-card__header">
                                <div className="specialist-card__avatar">
                                    <img
                                        src={doctor.userAvatar ? `${URL}/${doctor.userAvatar}` : '/default-avatar.png'}
                                        alt={`${doctor.user.surname} ${doctor.user.name}`}
                                    />
                                </div>

                                <div className="specialist-card__info">
                                    <h2 className="specialist-card__name">
                                        {doctor.user.surname} {doctor.user.name} {doctor.user?.patronymic}
                                    </h2>
                                    <p className="specialist-card__experience">
                                        Опыт работы: {doctor.experienceYears} {doctor.experienceYears === 1 ? 'год' :
                                            doctor.experienceYears < 5 ? 'года' : 'лет'}
                                    </p>
                                    <p className="specialist-card__status">
                                        Статус: {doctor.isActivated ? 'Активен' : 'Не активен'}
                                    </p>
                                </div>
                            </div>

                            {doctor.profData ? (
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
                                <div className="consultation__empty">Для вас рекомендаций не найдено</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AccountLayout>
    );
};

export default Specialists;