import styles from './Header.module.css'
import logo from '../../assets/logo.png'
import avatar from '../../assets/avatar.png'
import { Link } from 'react-router'

const Header =() => {
    return (
        <>
            <div className={styles.header}>
                <Link to="/">
                    <img className={styles.header__logo} src={logo} alt="logo_medonline" />
                </Link>
                <nav className={styles.header__nav}>
                    <a href="#">Решаемые проблемы</a>
                    <a href="#">Запись на консультацию</a>
                    <a href="#">Полезная информация</a>
                    <a href="#">Контакты</a>
                    <a href="#">Цены</a>
                </nav>
                <div className={styles.header__profile}>
                    <div className={styles.profile__number}>
                        номер телефона на главной панели
                    </div>
                    <Link to="/register">
                        <img src={avatar} alt="avatar" />
                    </Link>
                </div>
            </div>
        </>
    );
}

export default Header
