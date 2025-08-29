import { useEffect } from 'react';
import './UpcomingConsultations.scss';
import BatchService from '../../../services/BatchService';

interface UserConsultationsProps {
    id: number;
}

interface Consultation {
    id: number;
    date: string;
    time: string;
    specialist: string;
    symptoms: string;
    details: string;
}

const UserConsultations:React.FC<UserConsultationsProps> = ({ id }) => {
    const fetchConsultations = () => {
        // const response = BatchService.getAllConsultions(id);
        // console.log(response);
    }

    useEffect(() => {
        fetchConsultations();
    }, [])

    const consultations: Consultation[] = [
        {
            id: 1,
            date: 'Завтра',
            time: '15:30-16:30',
            specialist: 'Анна Петрова',
            symptoms: 'Головная боль',
            details: 'Периодические головные боли в течение последних двух недель, усиливаются к вечеру'
        },
    ];

    return (
        <div className="user-consultations">
            <h2 className='user-consultations__title'>Предстоящие консультации</h2>

            {consultations.map(consultation => (
                <div key={consultation.id} className="consultation-card">
                    <div className="consultation-card__time">
                        <span className="consultation-card__date">{consultation.date}</span>
                        <span className="consultation-card__hours">{consultation.time}</span>
                    </div>

                    <div className="consultation-card__info">
                        <div className="consultation-card__specialist">
                            Специалист: <span>{consultation.specialist}</span>
                        </div>

                        <div className="consultation-card__symptoms">
                            Симптомы: <span>{consultation.symptoms}</span>
                        </div>

                        <div className="consultation-card__details">
                            Симптомы подробно: <span>{consultation.details}</span>
                        </div>
                    </div>

                    <div className="consultation-card__actions">
                        <button className="consultation-card__button consultation-card__button--transfer">
                            Перенести
                        </button>
                        <button className="consultation-card__button consultation-card__button--cancel">
                            Отменить
                        </button>
                        <button className="consultation-card__button consultation-card__button--repeat">
                            Повторить
                        </button>
                        <button className="consultation-card__button consultation-card__button--edit">
                            Редактировать
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default UserConsultations;