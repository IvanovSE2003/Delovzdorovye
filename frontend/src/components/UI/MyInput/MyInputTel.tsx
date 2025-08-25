// components/UI/MyInput/MyInputTel.tsx
import { useState, useCallback } from 'react';
import './MyInput.scss'; 

interface MyInputTelProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  className?: string;
  label?:string;
}

const MyInputTel: React.FC<MyInputTelProps> = ({
  value,
  onChange,
  id = 'phone',
  required = false,
  className = '',
  label="Номер телефона"
}) => {
  const [isError, setIsError] = useState(false);

  const formatPhoneNumber = useCallback((inputValue: string): string => {
    // Удаляем все нецифровые символы
    let numbers = inputValue.replace(/\D/g, '');
    
    // Убираем ведущую 7 или 8 если есть
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
    // Разрешаем: backspace, delete, tab, escape, enter
    if ([46, 8, 9, 27, 13].includes(e.keyCode) || 
        // Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) || 
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Цифры на основной клавиатуре и numpad
        (e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 96 && e.keyCode <= 105)) {
      return;
    }
    e.preventDefault();
  }, []);

  return (
    <div className='my-input-td__input-group'>
      <input
        type="tel"
        id={id}
        autoComplete="billing mobile tel"
        value={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`my-input-td__input ${className} ${isError ? 'my-input-rd__invalid' : ''}`}
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
