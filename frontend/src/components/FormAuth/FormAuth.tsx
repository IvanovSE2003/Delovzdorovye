import './FromAuth.css';
import { Link } from 'react-router';
import logo from '../../assets/logo.png'

const FormAuth = () => {
    return (
        <div className='auth__window'>
            <div className='auth__left'>
                <Link to="/">
                    <img src={logo} alt="logo_medonline" />
                </Link>
            </div>
            <div className='auth__right'>
                <h3>Вход или регистрация</h3>
                <form action="" className="auth__form">
                    <input type="text" placeholder='Телефон*'/>
                    <button>Получить код</button>
                </form>
                <a href="/auth_email">Войти по эл. почте</a>
            </div>
        </div>
    )
}

export default FormAuth;