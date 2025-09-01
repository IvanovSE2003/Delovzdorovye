import { observer } from 'mobx-react-lite';
import { useContext, Suspense, lazy } from 'react';
import { Context } from '../../main';
import AccountLayout from './AccountLayout';
import Loader from '../../components/UI/Loader/Loader';

const componentMap = {
  PATIENT: lazy(() => import('./PatientPage')),
  DOCTOR: lazy(() => import('./DoctorPage')),
  ADMIN: lazy(() => import('./AdminPage')),
};

const Account: React.FC = observer(() => {
  const { store } = useContext(Context);
  const Component = componentMap[store.user.role as keyof typeof componentMap];

  return (
    <AccountLayout>
      <Suspense fallback={<Loader/>}>
        {Component ? <Component /> : <div>Неизвестная роль</div>}
      </Suspense>
    </AccountLayout>
  );
});

export default Account;