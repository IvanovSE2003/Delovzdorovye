import './Header.scss'
import logo from '../../../assets/images/logo.png'
import avatar from '../../../assets/images/avatar.png'
import React from 'react'
import { Link } from 'react-router'

const Header: React.FC =() => {
    return (
        <>
            <div className='header'>
                <Link to="/">
                    <img className='header__logo' src={logo} alt="logo_medonline" />
                </Link>
                <nav className='header__nav'>
                    <a href="#">Решаемые проблемы</a>
                    <a href="#">Запись на консультацию</a>
                    <a href="#">Полезная информация</a>
                    <a href="#">Контакты</a>
                    <a href="#">Цены</a>
                </nav>
                <div className='header__profile'>
                    <div className='profile__number'>
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
