import { useContext, useEffect, useState } from 'react';
import DoctorPage from './DoctorPage';
import PatientPage from './PatientPage';
import ActivatedEmail from './ActivatedEmail';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';

import HeaderProfile from './HeaderProfile/HeaderProfile';
import RightPanel from './RightPanel/RightPanel';

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
            <div className='account'>
                <HeaderProfile />
                <div className="account__main">
                    <main className='account__content'>
                        {role === "PATIENT" && <PatientPage />}
                        {role === "DOCTOR" && <DoctorPage />}
                    </main>
                    <RightPanel />
                </div>
            </div>
            :
            <ActivatedEmail />
    )
}

export default observer(PersonalPage);