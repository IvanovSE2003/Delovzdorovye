import { useState, useRef, useEffect, type FormEvent } from 'react';
import './FormAuth.css';

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
  const [userDetails, setUserDetails] = useState<UserDetails>({
    lastName: '',
    firstName: '',
    middleName: '',
    gender: '',
    birthDate: '',
    timezone: '',
  });
  const [error, setError] = useState<string>('');
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 2 && codeInputRef.current) {
      codeInputRef.current.value = "";
      codeInputRef.current.focus();
    }
  }, [step]);

  const toggleAuthType = (): void => {
    setIsEmailAuth(prev => !prev);
    setPhoneOrEmail("")
    setError("")
  };

  const handleSubmitContact = (e: FormEvent): void => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) {
      setError('Поле обязательно для заполнения');
      return;
    }

    // Отправить код подтверждения на телефон или почту
    // Записать отправленный код в переменную const sendCode:number

    setError('');
    setStep(2);
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

    // Сравнить введенное значение code с SendCode
    // то есть if(code === sendCode) {
    setError('');
    setStep(3);
    // }
  };

  const handleSubmitDetails = (e: FormEvent): void => {
    e.preventDefault();
    const isEmptyField = Object.values(userDetails).some(
      (value) => !value || value.trim() === ""
    );

    if (isEmptyField) {
      setError('Все поля должны быть заполнены!');
      return;
    }

    setError('');
    const userData = {
      contactType: isEmailAuth ? 'email' : 'phone',
      contactValue: phoneOrEmail,
      ...userDetails
    };
    console.log('Данные для регистрации:', userData);
    // Отправка userData на сервер 
    window.location.href = '/personal';
  };

  const handleBack = (): void => {
    if (step > 1) {
      setStep(prev => (prev - 1) as 1 | 2 | 3);
      setError('');
    }
  };

  const handleDetailsChange = (field: keyof UserDetails, value: string | Gender): void => {
    setUserDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <h3>
        {step === 1 && 'Вход или регистрация'}
        {step === 2 && 'Подтверждение'}
        {step === 3 && 'Завершающий этап'}
      </h3>

      {error && <p className="auth__error">{error}</p>}

      {/* Шаг 1: Ввод телефона/почты */}
      {step === 1 && (
        <form onSubmit={handleSubmitContact} className="auth__form">
          {isEmailAuth ? (
            <input
              type="email"
              placeholder="Почта"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
            />
          ) : (
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Телефон"
              value={phoneOrEmail}
              maxLength={11}
              onChange={(e) => setPhoneOrEmail(e.target.value.replace(/\D/g, ''))}
            />
          )}
          <button type="submit">Получить код</button>
          <a
            onClick={toggleAuthType}
            className="auth__toggle-button"
          >
            {isEmailAuth ? "Войти по телефону" : "Войти по эл. почте"}
          </a>
        </form>
      )}

      {/* Шаг 2: Ввод кода подтверждения */}
      {step === 2 && (
        <form onSubmit={handleSubmitCode} className="auth__form">
          <p style={{ textAlign: 'center' }}>
            Код отправлен на {isEmailAuth ? ' почту' : ' телефон'}:
            <strong>{' ' + phoneOrEmail}</strong>
          </p>
          <input
            ref={codeInputRef}
            type="text"
            inputMode="numeric"
            placeholder="Введите 6-значный код"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            required
          />
          <button type="submit">Подтвердить</button>
          <button
            type="button"
            onClick={handleBack}
            className="auth__toggle-button"
          >
            Назад
          </button>
        </form>
      )}

      {/* Шаг 3: Завершающий этап */}
      {step === 3 && (
        <form onSubmit={handleSubmitDetails} className="auth__form">
          <div className="form-group">
            <input
              type="text"
              value={userDetails.lastName}
              onChange={(e) => handleDetailsChange('lastName', e.target.value)}
              placeholder='Фамилия'

            />
          </div>

          <div className="form-group">
            <input
              type="text"
              value={userDetails.firstName}
              onChange={(e) => handleDetailsChange('firstName', e.target.value)}
              placeholder='Имя'
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              value={userDetails.middleName}
              onChange={(e) => handleDetailsChange('middleName', e.target.value)}
              placeholder='Отчество'
            />
          </div>

          <div className="form-group radios">
            <label>Пол</label>
            <div className='radio'>
              <input
                type="radio"
                value="male"
                name="gender"
                onChange={(e) => handleDetailsChange('gender', e.target.value)}
              />
              Мужской
            </div>
            <div className='radio'>
              <input
                type="radio"
                value="female"
                name="gender"
                onChange={(e) => handleDetailsChange('gender', e.target.value)}
              />
              Женский
            </div>
          </div>

          <div className="form-group">
            <input
              type="date"
              value={userDetails.birthDate}
              onChange={(e) => handleDetailsChange('birthDate', e.target.value)}
              placeholder='Дата рождения'
              required
            />
          </div>

          <div className="form-group">
            <select
              value={userDetails.timezone}
              onChange={(e) => handleDetailsChange('timezone', e.target.value)}
            >
              <option value="">Часовой пояс</option>
              <option value="Europe/Moscow">Москва (UTC+3)</option>
              <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
              <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
            </select>
          </div>

          <button type="submit">Завершить регистрацию</button>
          <button
            type="button"
            onClick={handleBack}
            className="auth__toggle-button"
          >
            Назад
          </button>
        </form>
      )}
    </>
  );
};

export default FormAuth;