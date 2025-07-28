import React from 'react';
import avatar from '../../assets/images/avatar.png'
import './UserProfile.scss';

const UserProfile: React.FC = () => {
    return (
        <div className="user-profile">
            <div className="user-profile__avatar">
                <img src={avatar} alt="" />
            </div>

            <div className="user-profile__info">
                <div className='info-row'>
                    <span className="info-label">Фамилия:</span>
                    <span className="info-value">Иванова</span>
                </div>

                <div className='info-row'>
                    <span className="info-label">Имя:</span>
                    <span className="info-value">Екатерина</span>
                </div>

                <div className='info-row'>
                    <span className="info-label">Отчество:</span>
                    <span className="info-value">Владимировна</span>
                </div>

                <div className="info-row">
                    <span className="info-label">Пол:</span>
                    <span className="info-value">Женский</span>
                </div>

                <div className="info-row">
                    <span className="info-label">Дата рождения:</span>
                    <span className="info-value">01.11.2000</span>
                </div>

                <div className="info-row">
                    <span className="info-label">Часовой пояс:</span>
                    <span className="info-value">Екатеринбург (UTC+5)</span>
                </div>

                <div className="info-row">
                    <span className="info-label">Телефон: </span>
                    <span className="info-value">+7 900 500 60 70</span>
                </div>

                <div className="info-row">
                    <span className="info-label">Email: </span>
                    <span className="info-value">Не указано</span>
                </div>

                <button className="user-profile__edit-button">РЕДАКТИРОВАТЬ</button>
            </div>
        </div>
    );
};

export default UserProfile;