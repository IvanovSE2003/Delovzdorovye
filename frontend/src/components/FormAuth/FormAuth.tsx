import { useState, useRef, useEffect, type FormEvent } from 'react';
import './FormAuth.scss';

type Gender = 'male' | 'female' | '';
interface UserDetails {
  lastName: string;
  firstName: string;
  middleName: string;
  gender: Gender;
  birthDate: string;
  timezone: string;
}

const FormAuth = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isEmailAuth, setIsEmailAuth] = useState<boolean>(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRegisteredUser, setIsRegisteredUser] = useState<boolean | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  const [userDetails, setUserDetails] = useState<UserDetails>({
    lastName: '',
    firstName: '',
    middleName: '',
    gender: '',
    birthDate: '',
    timezone: '',
  });

  useEffect(() => {
    if (step === 2 && codeInputRef.current) {
      codeInputRef.current.value = "";
      codeInputRef.current.focus();
    }
  }, [step]);

  const toggleAuthType = (): void => {
    setIsEmailAuth(prev => !prev);
    setPhoneOrEmail('');
    setError('');
  };

  const handleSubmitContact = (e: FormEvent): void => {
    e.preventDefault();

    if (isEmailAuth) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);
      if (!emailValid) {
        setError("Введите корректный email");
        return;
      }
    } else {
      const phoneValid = /^(\+7|8)\d{10}$/.test(phoneOrEmail);
      if (!phoneValid) {
        setError("Введите корректный номер телефона (8XXXXXXXXXX или +7XXXXXXXXXX)");
        return;
      }
    }

    setError('');

    // Имитируем проверку в базе
    const mockRegisteredUsers = ['+79991234567', 'test@example.com'];
    const isRegistered = mockRegisteredUsers.includes(phoneOrEmail);
    setIsRegisteredUser(isRegistered);
    setCode('')
    setStep(isRegistered ? 2 : 3);
  };

  const handleSubmitCode = (e: FormEvent): void => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Введите код подтверждения');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    // Здесь могла бы быть проверка кода от сервера
    setError('');
    window.location.href = '/personal'; // Или setStep(3), если есть профиль
  };

  const handleSubmitDetails = (e: FormEvent): void => {
    e.preventDefault();

    const isEmpty = Object.values(userDetails).some(value => !value || value.trim() === '');
    if (isEmpty) {
      setError('Все поля должны быть заполнены!');
      return;
    }

    setError('');

    const userData = {
      contactType: isEmailAuth ? 'email' : 'phone',
      contactValue: phoneOrEmail,
      ...userDetails
    };

    console.log('Регистрируем пользователя:', userData);
    window.location.href = '/personal';
  };

  const handleBack = () => {
    setError('');
    if (step > 1) {
      setStep(1);
      setIsRegisteredUser(null);
    }
  };

  const handleDetailsChange = (field: keyof UserDetails, value: string | Gender): void => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="auth">
      <h3>
        {step === 1 && 'Вход или регистрация'}
        {step === 2 && 'Введите PIN-код'}
        {step === 3 && 'Регистрация'}
      </h3>

      {error && <p className="auth__error">{error}</p>}

      {step === 1 && (
        <form onSubmit={handleSubmitContact} className="auth__form">
          <input
            className="auth__input"
            type={isEmailAuth ? 'email' : 'tel'}
            placeholder={isEmailAuth ? 'Электронная почта' : 'Телефон'}
            value={phoneOrEmail}
            onChange={(e) => {
              const val = isEmailAuth
                ? e.target.value
                : e.target.value.replace(/[^\d+]/g, '');
              setPhoneOrEmail(val);
            }}
            required
          />

          <button type="submit" className="auth__button">Продолжить</button>

          <a onClick={toggleAuthType} className="auth__toggle-button" role="button">
            {isEmailAuth ? 'Войти по телефону' : 'Войти по эл. почте'}
          </a>
        </form>
      )}

      {step === 2 && isRegisteredUser && (
        <>
          <input type="text" placeholder='Введите пин-код' />
          <button type="button" onClick={handleBack} className="auth__button">Назад</button>
        </>
      )}

      {step === 3 && !isRegisteredUser && (
        <form onSubmit={handleSubmitDetails} className="auth__form">
          <input
            type="text"
            placeholder="Фамилия"
            value={userDetails.lastName}
            onChange={(e) => handleDetailsChange('lastName', e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Имя"
            value={userDetails.firstName}
            onChange={(e) => handleDetailsChange('firstName', e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Отчество"
            value={userDetails.middleName}
            onChange={(e) => handleDetailsChange('middleName', e.target.value)}
          />

          <div className="form-group radios">
            <label>Пол:</label>
            <div className="radio">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={userDetails.gender === 'male'}
                onChange={(e) => handleDetailsChange('gender', e.target.value)}
              /> Мужской
            </div>
            <div className="radio">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={userDetails.gender === 'female'}
                onChange={(e) => handleDetailsChange('gender', e.target.value)}
              /> Женский
            </div>
          </div>

          <input
            type="date"
            value={userDetails.birthDate}
            onChange={(e) => handleDetailsChange('birthDate', e.target.value)}
            required
          />

          <select
            value={userDetails.timezone}
            onChange={(e) => handleDetailsChange('timezone', e.target.value)}
            required
          >
            <option value="">Выберите часовой пояс</option>
            <option value="Europe/Moscow">Москва (UTC+3)</option>
            <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
            <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
          </select>

          <button type="submit" className="auth__button">Завершить регистрацию</button>
          <button type="button" onClick={handleBack} className="auth__toggle-button">Назад</button>
        </form>
      )}
    </div>
  );
};

export default FormAuth;
