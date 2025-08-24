import { useEffect, useState } from "react";
import $api, { API_URL, URL } from "../../../http";
import AccountLayout from "../AccountLayout";


interface IDoctors {
    img: string;
    experienceYears: number;
    diploma: string;
    license: string;
    specializations: string[],
    userName: string,
    userSurname: string,
    userPatronymic: string,
    userAvatar: string,
    // timeZone: string;
}

const Specialists: React.FC = () => {
    const [doctors, setDoctors] = useState<IDoctors[]>([])


    useEffect(() => {
        $api.get(`${API_URL}/doctor/all`)
            .then(response => {
                setDoctors(response.data.data);
            })
            .catch(error => {
                if (error.response) {
                    console.error('Ошибка сервера:', error.response.status);
                    throw new Error("Ошибка при загрузке специалистов!");
                }
            });
    }, [])

    return (
        <AccountLayout>
            <h1 className="specialists__title">Список специалистов</h1>
            <div className="specialists">
                {doctors.map((doctor: any) => (
                    <div key={doctor.id} className="profile">
                        <div className="profile__avatar">
                            <img src={`${URL}/${doctor.userAvatar}`} alt="avatar-delovzdorovye" />
                        </div>

                        <div className="profile__info">
                            <div className="profile__fio"> {doctor.userSurname} {doctor.userName} {doctor.userPatronymic} </div>

                            <div className="profile__main-info">
                                <span><span className="label">{doctor.specializations.length > 1 ? "Специализации" : "Специализация"}: </span> {doctor.specializations.join(', ')} </span>
                                {/* <span><span className="label">Опыт работы: </span>{doctor.experienceYears}</span> */}
                                <span><span className="label">Диплом: </span><a target="_blank" href={`${URL}/${doctor.diploma}`}>Документ</a></span>
                                <span><span className="label">Лицензия: </span><a target="_blank" href={`${URL}/${doctor.license}`}>Документ</a></span>
                                {/* <span><span className="label">Часовой пояс:</span>{doctor.timeZone}</span> */}
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </AccountLayout>
    )
}

export default Specialists;