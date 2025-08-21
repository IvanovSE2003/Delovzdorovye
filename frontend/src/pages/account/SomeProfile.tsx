import { useEffect, useState } from "react";
import Loader from "../../components/UI/Loader/Loader";
import { API_URL, URL } from "../../http";
import type { IUserDataProfile } from "../../models/Auth";
import AccountLayout from "./AccountLayout";
import { useParams } from "react-router";

const Profile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState<IUserDataProfile | null>(null)

    useEffect(() => {
        fetch(`${API_URL}/profile/${id}`)
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
        <AccountLayout>
            <div className="some-profile">
                <div className="some-profile__avatar">
                    <img src={`${URL}/${profile.img}`} alt="avatar-delovzdorovye" />
                </div>

                <div className="some-profile__info">

                    <div>
                        {(!profile.name && !profile.surname && !profile.patronymic)
                            ? <div className="some-profile__fio"> Анонимный пользователь </div>
                            : <div className="some-profile__fio"> {profile.surname} {profile?.name} {profile?.patronymic} </div>
                        }
                        <div className="some-profile__role">
                            {profile.role ? profile.role : "Неизвестная роль"}
                        </div>
                    </div>

                    <div className="some-profile__main-info">
                        <span><span className="label">Пол:</span> {profile.gender}</span>
                        <span><span className="label">Дата рождения:</span> {GetFormatDate(profile.dateBirth)}</span>
                        <span><span className="label">Номер телефона:</span> {GetFormatPhone(profile.phone)}</span>
                        <span><span className="label">E-mail:</span> {profile.email}</span>
                    </div>

                </div>
            </div>
        </AccountLayout>
    )
}

export default Profile;