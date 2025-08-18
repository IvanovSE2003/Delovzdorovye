import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Context } from '../../main';
import DoctorPage from './DoctorPage';
import PatientPage from './PatientPage';
import Specialists from './admin/Specialists';

import { useNavigate } from 'react-router';
import { RouteNames } from '../../routes';

const PersonalPage = () => {
  const navigate = useNavigate();
  const { store } = useContext(Context);
  const logout = async () => {
    await store.logout();
    navigate(RouteNames.MAIN);
  }

  switch (store.user.role) {
    case 'PATIENT':
      return <PatientPage />;
    case 'DOCTOR':
      return <DoctorPage />;
    case 'ADMIN':
      return (
        <>
          <button onClick={logout}>Выйти</button>
          <Specialists />
        </>
      );
    default:
return <div>Неизвестная роль</div>;
  }
};

export default observer(PersonalPage);