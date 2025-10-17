import { useState, useEffect } from 'react';
import AccountLayout from "../../AccountLayout";
import './MakeConsultation.scss';
import AdminService from '../../../../services/AdminService';
import SearchInput from '../../../../components/UI/Search/Search';
import { Link } from 'react-router';
import { processError } from '../../../../helpers/processError';
import LoaderUsefulInfo from '../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo';
import { GetFormatPhone } from '../../../../helpers/formatPhone';

export interface UserCon {
    countOtherProblem: number;
    id: number;
    hasOtherProblem?: boolean;
    name: string;
    surname: string;
    patronymic?: string;
    phone: string;
}

const MakeConsultation: React.FC = () => {
    const [users, setUsers] = useState<UserCon[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserCon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState<boolean>(false);

    // Получение данных
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await AdminService.userConsult();
            setUsers(response.data.users);
        } catch (e) {
            processError(e, 'Ошибка при загрузке пользователей:');
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return (
        <AccountLayout>
            <div className="page-container makeconsultation">
                <h1 className="consultations-doctor__main-title">Пользователи системы</h1>
                <LoaderUsefulInfo />
            </div>
        </AccountLayout>
    )

    return (
        <AccountLayout>
            <div className="page-container makeconsultation">
                <h1 className="consultations-doctor__main-title">Пользователи системы</h1>

                <SearchInput
                    placeholder="Поиск по ФИО и телефону"
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                <div className="makeconsultation__list">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <div key={user.id} className={`makeconsultation__user-card ${user.hasOtherProblem ? "other-problem" : ""}`}>
                            <div className="makeconsultation__user-info">
                                <span className="makeconsultation__user-name">
                                    {user.name && user.surname && user?.patronymic ? (
                                        <>{user.surname} {user.name} {user.patronymic} <span>{user.countOtherProblem > 0 && `(${user.countOtherProblem})`}</span></>
                                    ) : (
                                        <>Анонимный пользователь</>
                                    )}
                                </span>
                                <span className="makeconsultation__user-phone">{GetFormatPhone(user.phone)}</span>
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