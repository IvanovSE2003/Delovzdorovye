import { useState, useEffect } from 'react';
import AccountLayout from "../../AccountLayout";
import './MakeConsultation.scss';
import AdminService from '../../../../services/AdminService';
import SearchInput from '../../../../components/UI/Search/Search';
import { Link } from 'react-router';

export interface UserCon {
    id: number;
    hasOtherProblem?: boolean;
    name: string;
    surname: string;
    patronymic?: string;
    phone: string;
}

const MakeConsultation:React.FC = () => {
    const [users, setUsers] = useState<UserCon[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserCon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user =>
            `${user.surname} ${user.name} ${user.patronymic} ${user.phone}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const response = await AdminService.userConsult();
            setUsers(response.data.users);
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
        }
    };

    return (
        <AccountLayout>
            <div className="page-container makeconsultation">
                <h1 className="admin-page__title">Пользователи системы</h1>

                <SearchInput
                    placeholder="Введите телефон, имя, фамилию пользователя"
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                <div className="makeconsultation__list">
                    {filteredUsers.length>0 ? filteredUsers.map(user => (
                        <div key={user.id} className={`makeconsultation__user-card ${user.hasOtherProblem ? "other-problem" : ""}`}>
                            <div className="makeconsultation__user-info">
                                <span className="makeconsultation__user-name">
                                    {user.name && user.surname && user?.patronymic ? (
                                        <>{user.surname} {user.name} {user.patronymic}</>
                                    ) : (
                                        <>Анонимный пользователь</>
                                    )}
                                </span>
                                <span className="makeconsultation__user-phone">{user.phone}</span>
                            </div>
                            <Link
                                to={`/profile/${user.id}`}
                            >
                                <button className="makeconsultation__profile-button">
                                    Профиль
                                </button>
                            </Link>
                        </div>
                    )) : (
                        <div className="consultation__empty">Пользователей не найдено</div>
                    )}
                </div>
            </div>
        </AccountLayout>
    );
};

export default MakeConsultation;