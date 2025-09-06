import { useState, useEffect } from 'react';
import AccountLayout from "../../AccountLayout";
import './MakeConsultation.scss';
import BatchService from '../../../../services/AdminService';
import SearchInput from '../../../../components/UI/Search/Search';
import { Link } from 'react-router';

export interface UserCon {
    id: number;
    name: string;
    surname: string;
    patronymic?: string;
    phone: string;
}

const MakeConsultation = () => {
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
            const response = await BatchService.userConsult();
            setUsers(response.data.users);
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
        }
    };

    return (
        <AccountLayout>
            <div className="makeconsultation">
                <h1 className="admin-page__title">Пользователи системы</h1>

                <SearchInput
                    placeholder="Введите телефон, имя, фамилию пользователя"
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                <div className="makeconsultation__list">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="makeconsultation__user-card">
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
                    ))}
                </div>
            </div>
        </AccountLayout>
    );
};

export default MakeConsultation;