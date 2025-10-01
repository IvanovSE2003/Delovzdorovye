import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

interface CustomToolbarProps {
    date: Date;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    onView?: (view: string) => void;
    label?: string;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ date, onNavigate }) => {
    // Добавляем проверки
    if (!date) {
        return <div>Загрузка...</div>;
    }
    
    const startOfWeek = dayjs(date).startOf('week');
    const endOfWeek = dayjs(date).endOf('week');
    
    const formatDateRange = () => {
        try {
            const startFormat = startOfWeek.date() === endOfWeek.date() ? 'D MMMM' : 'D';
            const endFormat = 'D MMMM';
            
            return `${startOfWeek.format(startFormat)} - ${endOfWeek.format(endFormat)}`;
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return 'Ошибка даты';
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
        }}>
            <h1>Расписание</h1>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 30px',
                background: 'white',
                width: '400px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
                <button 
                    onClick={() => onNavigate('PREV')}
                    style={{ 
                        cursor: 'pointer', 
                        fontSize: '20px',
                        padding: '5px 10px',
                        userSelect: 'none',
                        background: 'none',
                        border: 'none'
                    }}
                >‹</button>
                
                <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '500',
                    textTransform: 'lowercase'
                }}>
                    {formatDateRange()}
                </span>
                
                <button 
                    onClick={() => onNavigate('NEXT')}
                    style={{ 
                        cursor: 'pointer', 
                        fontSize: '20px',
                        padding: '5px 10px',
                        userSelect: 'none',
                        background: 'none',
                        border: 'none'
                    }}
                >›</button>
            </div>
        </div>
    );
};

export default CustomToolbar;