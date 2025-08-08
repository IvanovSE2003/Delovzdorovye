import { useContext, useEffect, useState } from 'react';
import SideBar from '../../components/UI/SideBar/SideBar';
import Timer from '../../components/UI/Timer/Timer';
import DoctorPage from './DoctorPage';
import PatientPage from './PatientPage';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';

const PersonalPage = () => {
    const { store } = useContext(Context);
    const [role, setRole] = useState<string>("");

    useEffect(() => {
        setRole(store.user.role);
        console.log(store.user.role);
    }, [store.user])

    return (
        <div className='account-wrapper'>
            <SideBar />
            <div className='account-main'>
                {role === "PATIENT" && <PatientPage/>}
                {role === "DOCTOR" && <DoctorPage/>}
            </div>
            <Timer />
        </div>
    )
}

export default observer(PersonalPage);