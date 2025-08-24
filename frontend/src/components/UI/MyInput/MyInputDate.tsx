import { useState } from 'react';
import './MyInput.scss'

interface MyInputDateProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?:string;
    className?: string;
}

const DateInput: React.FC<MyInputDateProps> = ({
    id,
    label,
    value,
    onChange,
    placeholder="",
    className = ""
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value.replace(/\D/g, '');

        if (raw.length > 4 && raw.length <= 6) {
            raw = raw.substring(0, 4) + '.' + raw.substring(4);
        } else if (raw.length > 6) {
            raw = raw.substring(0, 4) + '.' + raw.substring(4, 6) + '.' + raw.substring(6, 8);
        }

        // Валидация
        if (/^\d{4}\.\d{2}\.\d{2}$/.test(raw)) {
            const [year, month, day] = raw.split('.').map(Number);
            const date = new Date(year, month - 1, day);

            const today = new Date();
            today.setHours(0, 0, 0, 0); // сравниваем только даты без времени

            const isValid =
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day;

            if (!isValid) {
                setError("Некорректная дата");
            } else if (date > today) {
                setError("Дата не может быть в будущем :)");
            } else {
                setError(null);
            }
        } else {
            setError(null);
        }

        onChange(raw);
    };

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
                placeholder={placeholder}
            />
            <label htmlFor={id}>{label}</label>
            {error && <span className="my-input-td__error">{error}</span>}
        </div>
    );
}

export default DateInput;
