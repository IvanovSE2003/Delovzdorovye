import { useState, useEffect } from 'react';
import './ArchiveConsultations.scss';

interface Consultation {
    id: number;
    date: string;
    time: string;
    specialist: string;
    symptoms: string;
    details: string;
    recommendationFile?: string;
}

const ArchiveConsultations: React.FC = () => {
    const [consultations, setConsultations] = useState<Consultation[]>([
        {
            id: 1,
            date: 'Вчера',
            time: '15:30-16:30',
            specialist: 'Анна Петрова',
            symptoms: 'Головная боль',
            details: 'Периодические головные боли в течение последних двух недель',
            recommendationFile: 'recommendation.pdf'
        },
        {
            id: 2,
            date: '08.09.2025',
            time: '15:30-16:30',
            specialist: 'Анна Петрова',
            symptoms: 'Боли в спине',
            details: 'Ноющие боли в поясничном отделе после физических нагрузок',
            recommendationFile: 'recommendation2.pdf'
        }
    ]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchArchiveConsultations();
    }, []);

    const fetchArchiveConsultations = async () => {
        try {
            setLoading(true);
            // Замените на ваш реальный эндпоинт
            //   const response = await axios.get<Consultation[]>('https://api.example.com/archive-consultations');
            //   setConsultations(response.data);
        } catch (err) {
            //   setError('Ошибка при загрузке архивных консультаций');
            //   console.error('Ошибка при загрузке данных:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRepeatConsultation = (id: number) => {
        // Логика повторения консультации
        console.log('Повторить консультацию:', id);
    };

    const handleDownloadRecommendation = (fileUrl: string) => {
        // Логика скачивания файла рекомендации
        window.open(fileUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="archive-consultations">
                <h2 className="archive-consultations__title">Архив консультаций</h2>
                <div className="archive-consultations__loading">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="archive-consultations">
                <h2 className="archive-consultations__title">Архив консультаций</h2>
                <div className="archive-consultations__error">{error}</div>
            </div>
        );
    }

    return (
        <div className="archive-consultations">
            <h2 className="archive-consultations__title">Архив консультаций</h2>

            {consultations.length === 0 ? (
                <div className="archive-consultations__empty">Нет архивных консультаций</div>
            ) : (
                <div className="archive-consultations__list">
                    {consultations.map((consultation) => (
                        <div key={consultation.id} className="archive-consultation-card consultation-card--archived">
                            <div className="archive-consultation-card__header">
                                <strong>{consultation.date}, {consultation.time}</strong>
                            </div>

                            <div className="archive-consultation-card__info">
                                <div className="archive-consultation-card__specialist">
                                    Специалист: <span>{consultation.specialist}</span>
                                </div>

                                <div className="archive-consultation-card__symptoms">
                                    Симптомы: <span>{consultation.symptoms}</span>
                                </div>

                                <div className="archive-consultation-card__details">
                                    Симптомы подробно: <span>{consultation.details}</span>
                                </div>
                            </div>

                            <div className="archive-consultation-card__actions">
                                <button
                                    className="archive-consultation-card__button archive-consultation-card__button--repeat"
                                    onClick={() => handleRepeatConsultation(consultation.id)}
                                >
                                    Повторить
                                </button>

                                {consultation.recommendationFile && (
                                    <button
                                        className="archive-consultation-card__button archive-consultation-card__button--recommendation"
                                        onClick={() => handleDownloadRecommendation(consultation.recommendationFile!)}
                                    >
                                        Рекомендация: Файл
                                    </button>
                                )}
                            </div>

                            <div className="archive-consultation-card__divider"></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArchiveConsultations;