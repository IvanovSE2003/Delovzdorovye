import { useEffect, useState } from "react";
import Loader from "../../components/UI/Loader/Loader";
import { API_URL } from "../../http";
import type { IUserDataProfile } from "../../models/Auth";
import AccountLayout from "./AccountLayout";
import { useParams } from "react-router";
import { menuItemsDoctor } from "../../routes";

const Profile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState<IUserDataProfile | null>(null)

    useEffect(() => {
        fetch(`${API_URL}/user/${id}`)
            .then(res => res.json())
            .then(setProfile);
    }, [id]);

    const GetFormatDate = (date: string) => {
        return date.split('-').reverse().join('.');
    };

    const GetFormatPhone = (phone: string) => {
        return phone.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
    };

    if (!profile) return <Loader />

    return (
        <AccountLayout menuItems={menuItemsDoctor}>
            <div className="user-profile">
                <div className="user-profile__box">
                    <div className="user-profile__content">

                        <div className="user-profile__avatar-content">
                            <div className="user-profile__avatar">
                                <img src={`${URL}/${profile.img}`} alt="avatar-delovzdorovye" />
                            </div>
                        </div>

                        <div className="user-profile__info">

                            <div className="user-profile__fio">
                                {(!profile.name && !profile.surname && !profile.patronymic)
                                    ? <div> Анонимный пользователь </div>
                                    : <div> {profile.surname} {profile?.name} {profile?.patronymic} </div>
                                }
                            </div>

                            <div className="user-profile__main-info">
                                <span>Пол: {profile.gender}</span>
                                <span>Дата рождения: {GetFormatDate(profile.dateBirth)}</span>
                                <span>Номер телефона: {GetFormatPhone(profile.phone)}</span>
                                <span>E-mail: {profile.email}</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AccountLayout>
    )
}

export default Profile;