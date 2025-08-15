// PatientPage.tsx
import { menuItemsPatient } from '../../routes';
import AccountLayout from './AccountLayout';
import UserProfile from '../../features/account/UserProfile/UserProfile';
import PatientInfo from '../../features/account/PatientInfo/PatientInfo';

const PatientPage = () => {
  return (
    <AccountLayout menuItems={menuItemsPatient}>
      <UserProfile />
      <PatientInfo />
    </AccountLayout>
  );
};

export default PatientPage;