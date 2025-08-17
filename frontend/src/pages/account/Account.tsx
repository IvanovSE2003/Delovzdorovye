import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Context } from '../../main';
import DoctorPage from './DoctorPage';
import PatientPage from './PatientPage';
import Specialists from './admin/Specialists';

const PersonalPage = () => {
  const { store } = useContext(Context);

  switch (store.user.role) {
    case 'PATIENT':
      return <PatientPage />;
    case 'DOCTOR':
      return <DoctorPage />;
    case 'ADMIN':
      return <Specialists />;
    default:
      return <div>Неизвестная роль</div>;
  }
};

export default observer(PersonalPage);