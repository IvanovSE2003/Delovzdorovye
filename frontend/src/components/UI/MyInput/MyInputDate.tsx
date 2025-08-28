import { useEffect, useState } from 'react';
import './MyInput.scss'

interface MyInputDateProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?:string;
    className?: string;
    isError?: (value: boolean) => void;
}

const MyInputDate: React.FC<MyInputDateProps> = ({
    id,
    label,
    value,
    onChange,
    placeholder="",
    className = "",
    isError = (_value=false) => {},
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value.replace(/\D/g, '');
        let formatted = '';

        // Форматирование ввода: ДД.ММ.ГГГГ
        if (raw.length > 0) {
            formatted = raw.substring(0, 2);
            if (raw.length > 2) {
                formatted += '.' + raw.substring(2, 4);
            }
            if (raw.length > 4) {
                formatted += '.' + raw.substring(4, 8);
            }
        }

        // Валидация при полной дате
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(formatted)) {
            const [day, month, year] = formatted.split('.').map(Number);
            const date = new Date(year, month - 1, day);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const minDate = new Date();
            minDate.setFullYear(today.getFullYear() - 18);
            minDate.setHours(0, 0, 0, 0);

            const maxDate = new Date();
            maxDate.setFullYear(today.getFullYear() - 100);
            maxDate.setHours(0, 0, 0, 0);

            const isValid =
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day;

            if (!isValid) {
                setError("Некорректная дата (формат день.месяц.год)");
            } else if (date > today) {
                setError("Дата рождения не может быть в будущем :)");
            } else if (date > minDate) {
                setError("Возраст должен быть не менее 18 лет");
            } else if (date < maxDate) {
                setError("Возраст не может быть более 100 лет");
            } else {
                setError(null);
            }
        } else {
            setError(null);
        }

        onChange(formatted);
    };

    useEffect(() => {
        error ? isError(true) : isError(false);
    }, [error]);

    return (
        <div className={`my-input-td__input-group ${isFocused ? "focused" : ""}`}>
            <input
                type="text"
                id={id}
                name={id}
                value={value}
                className={`my-input-td__input ${className || ""} ${error ? "my-input-td__invalid" : ""}`}
                onChange={handleDateChange}
                maxLength={10}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder || "дд.мм.гггг"}
            />
            <label htmlFor={id}>{label}</label>
            {error && <span className="my-input-td__error">{error}</span>}
        </div>
    );
}

export default MyInputDate;