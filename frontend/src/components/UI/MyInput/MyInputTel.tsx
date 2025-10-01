import { useState, useCallback, useEffect } from 'react';
import './MyInput.scss';

interface MyInputTelProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  className?: string;
  label?: string;
  getIsError?: (value: boolean) => void;
}

const MyInputTel: React.FC<MyInputTelProps> = ({
  value,
  onChange,
  id = 'phone',
  required = false,
  className = '',
  label = "Номер телефона",
  getIsError = (_value = false) => { }
}) => {
  const [isError, setIsError] = useState(false);

  const formatPhoneNumber = useCallback((inputValue: string): string => {
    let numbers = inputValue.replace(/\D/g, '');
    if (numbers.startsWith('7') || numbers.startsWith('8')) {
      numbers = numbers.substring(1);
    }

    let formattedValue = '+7';

    if (numbers.length > 0) {
      formattedValue += ' (' + numbers.substring(0, Math.min(3, numbers.length));
    }
    if (numbers.length > 3) {
      formattedValue += ') ' + numbers.substring(3, Math.min(6, numbers.length));
    }
    if (numbers.length > 6) {
      formattedValue += ' ' + numbers.substring(6, Math.min(8, numbers.length));
    }
    if (numbers.length > 8) {
      formattedValue += ' ' + numbers.substring(8, Math.min(10, numbers.length));
    }

    // Валидация
    setIsError(numbers.length > 0 && numbers.length !== 10);

    return formattedValue;
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const formattedValue = formatPhoneNumber(input.value);
    onChange(formattedValue);
  }, [formatPhoneNumber, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (
      allowedKeys.includes(e.key) ||
      (e.key === "a" && e.ctrlKey) ||
      (e.key === "c" && e.ctrlKey) ||
      (e.key === "v" && e.ctrlKey) ||
      (e.key === "x" && e.ctrlKey) ||
      /^[0-9]$/.test(e.key) // цифры
    ) {
      return;
    }

    e.preventDefault();
  }, []);

  useEffect(() => {
    getIsError(isError);
  }, [isError])

  return (
    <div className='my-input-td__input-group'>
      <input
        type="tel"
        name={id}
        id={id}
        autoComplete="billing mobile tel"
        value={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`my-input-td__input ${className} ${isError ? 'my-input-td__invalid' : ''}`}
        placeholder="+7 (___) ___ __ __"
        maxLength={18}
        title={label}
        required={required}
      />
      <label htmlFor={id}>{label}</label>
      {isError && (
        <div className="my-input-td__error">
          Введите корректный номер телефона
        </div>
      )}
    </div>
  );
};

export default MyInputTel;
