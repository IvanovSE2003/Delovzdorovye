import { useContext, useEffect, useState } from 'react';
import SideBar from '../../components/UI/SideBar/SideBar';
import Timer from '../../components/UI/Timer/Timer';
import DoctorPage from './DoctorPage';
import PatientPage from './PatientPage';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
import { RouteNames } from '../../routes';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png'

const PersonalPage = () => {
    const { store } = useContext(Context);
    const [role, setRole] = useState<string>("");
    const [active, setActivte] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        setActivte(store.user.isActivated);
        setRole(store.user.role);
    }, [store.user])

    const sendActivated = async () => {
        const data = await store.sendActivate(store.user.email);
        data.success 
            ? setMessage(data.message)
            : setError(data.message);
        console.log(data);
    }

    return (
       !active
            ?
            <div className='account-wrapper'>
                <SideBar />
                <div className='account-main'>
                    {role === "PATIENT" && <PatientPage />}
                    {role === "DOCTOR" && <DoctorPage />}
                    {role === undefined && <PatientPage />}
                </div>
                <Timer />
            </div>
            :
            <div className='account-wrapper'>
                <div className='account-blocked'>
                    <div className="account-blocked-box">

                        <div className="account-blocked-logo">
                            <img src={logo}/>  
                        </div>  

                        <h3 className='account-blocked-message'>{message}</h3>
                        <h3 className='account-blocked-error'>{error}</h3>

                        <h1 className='account-blocked-box-title'>Активируйте аккаунт</h1>
                        <p className='account-blocked-box-description'>Для работы сервиса необходимо активировать электронную почту, которую вы указали при регистрации. Пожалуйта, перейдите на нее и следуйте инструкциям. В уважением команда "Дело в здоровье".</p>
                        <div className="account-blocked-box-buttons">
                            <button
                                className='account-blocked-box-button'
                                onClick={() => sendActivated()}
                            >
                                Отправить сообщение для активации
                            </button>
                            <Link to={RouteNames.MAIN} style={{ width: "100%" }}>
                                <button className='account-blocked-box-button'>
                                    Вернуться на главную страницу
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default observer(PersonalPage);