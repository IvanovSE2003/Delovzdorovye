import { useContext, useEffect, useState } from 'react';
import SideBar from '../../components/UI/SideBar/SideBar';
import Timer from '../../components/UI/Timer/Timer';

import DoctorPage from './DoctorPage';
import PatientPage from './PatientPage';
import ActivatedEmail from './ActivatedEmail';
import logo from '../../../public/logo.svg';
import "./PersonalAccount.scss";

import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
import { RouteNames } from '../../routes';
import { Link } from 'react-router-dom';

const PersonalPage = () => {
    const { store } = useContext(Context);
    const [role, setRole] = useState<string>("");
    const [active, setActivte] = useState<boolean>(false);

    useEffect(() => {
        setActivte(store.user.isActivated);
        setRole(store.user.role);
    }, [store.user])

    return (
        active
            ?
            <>
                <div className='account-header'>
                    <Link to={RouteNames.MAIN}>
                        <div className="account-header__logo">
                            <img src={logo} alt="logo_medonline" />
                        </div>
                    </Link>
                </div>
                <div className='account-wrapper'>
                    <SideBar />
                    <div className='account-main'>
                        {role === "PATIENT" && <PatientPage />}
                        {role === "DOCTOR" && <DoctorPage />}
                    </div>
                    {/* <Timer /> */}
                </div>
            </>
            :
            <ActivatedEmail />
    )
}

export default observer(PersonalPage);