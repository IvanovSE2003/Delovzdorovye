import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Context } from '../../main';
import AccountLayout from './AccountLayout';
import MyProfile from '../../features/account/MyProfile/MyProfile';
import DoctorInfo from '../../features/account/DoctorInfo/DoctorInfo';

const Account: React.FC = observer(() => {
  const { store } = useContext(Context);
  return (
    <AccountLayout>
      {store.user.role == "ADMIN" && (
        <MyProfile
          mode={'ADMIN'}
        />
      )}
      {store.user.role === "PATIENT" && (
        <MyProfile />
      )}
      {store.user.role === "DOCTOR" && (
        <>
          <MyProfile
            mode={"DOCTOR"}
          />
          <DoctorInfo
            type="WRITE"
          />
        </>
      )}
    </AccountLayout>
  );
});

export default Account;