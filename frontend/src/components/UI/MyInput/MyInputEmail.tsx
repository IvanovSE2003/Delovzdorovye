import { useState, useCallback } from 'react';
import './MyInput.scss'; 

interface MyInputEmailProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

const MyInputEmail: React.FC<MyInputEmailProps> = ({
  value,
  onChange,
  id = 'email',
  required = false,
  className = '',
  label = "Email",
  placeholder = "example@mail.ru"
}) => {
  const [isError, setIsError] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Регулярное выражение для валидации email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = useCallback((email: string): boolean => {
    return emailRegex.test(email);
  }, [emailRegex]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Валидируем только если поле было тронуто или содержит значение
    if (isTouched || inputValue.length > 0) {
      setIsError(inputValue.length > 0 && !validateEmail(inputValue));
    }
  }, [onChange, isTouched, validateEmail]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    setIsError(value.length > 0 && !validateEmail(value));
  }, [value, validateEmail]);

  const handleFocus = useCallback(() => {
    // Сбрасываем ошибку при фокусе, чтобы не мешать пользователю вводить
    if (isError) {
      setIsError(false);
    }
  }, [isError]);

  return (
    <div className='my-input-td__input-group'>
      <input
        type="email"
        id={id}
        autoComplete="email"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={`my-input-td__input ${className} ${isError ? 'my-input-td__invalid' : ''}`}
        placeholder={placeholder}
        title={label}
        required={required}
      />
      <label htmlFor={id}>{label}</label>
      {isError && (
        <div className="my-input-td__error">
          Введите корректный email адрес
        </div>
      )}
    </div>
  );
};

export default MyInputEmail;