import { useContext, useEffect, useState } from "react";
import Loader from "../../components/UI/Loader/Loader";
import $api, { URL } from "../../http";
import type { IUserDataProfile } from "../../models/Auth";
import AccountLayout from "./AccountLayout";
import { useParams } from "react-router";
import { Context } from "../../main";
import { observer } from "mobx-react-lite";

const Profile = () => {
    const { id } = useParams();
    const { store } = useContext(Context);
    const [profile, setProfile] = useState<IUserDataProfile | null>(null)

    const getDataProfile = async () => {
        if (!store.user?.id) return; 
        const { data } = await $api.post(`/profile/${id}`, { linkerId: store.user.id });
        console.log(data);
        setProfile(data);
    }

    useEffect(() => {
        if (store.user?.id) {
            getDataProfile();
        }
    }, [id, store.user.id]);


    const GetFormatDate = (date: string) => {
        return date?.split('-').reverse().join('.');
    };

    const GetFormatPhone = (phone: string) => {
        return phone?.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
    };

    if (!profile) return <Loader />

    return (
        <AccountLayout>
            <div className="profile">
                <div className="profile__avatar">
                    <img src={`${URL}/${profile.img}`} alt="avatar-delovzdorovye" />
                </div>

                <div className="profile__info">

                    <div>
                        {(!profile.name && !profile.surname && !profile.patronymic)
                            ? <div className="profile__fio"> Анонимный пользователь </div>
                            : <div className="profile__fio"> {profile.surname} {profile?.name} {profile?.patronymic} </div>
                        }
                        <div className="profile__role">
                            {profile.role ? profile.role : "Неизвестная роль"}
                        </div>
                    </div>

                    <div className="profile__main-info">
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

export default observer(Profile);