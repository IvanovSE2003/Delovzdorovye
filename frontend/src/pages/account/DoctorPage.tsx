// DoctorPage.tsx
import { menuItemsDoctor } from '../../routes';
import AccountLayout from './AccountLayout';
import DoctorInfo from '../../features/account/DoctorInfo/DoctorInfo';
import UserProfile from '../../features/account/UserProfile/UserProfile';

const DoctorPage = () => {
    return (
        <AccountLayout menuItems={menuItemsDoctor}>
            <UserProfile />
            <DoctorInfo />
        </AccountLayout>
    );
};

export default DoctorPage;