import MainPersonal from '../../components/AccountComponents/MainPersonal/MainPersonal';
import UserProfile from './UserProfile/UserProfile';
import SideBar from '../../components/UI/SideBar/SideBar';

const PatientPage: React.FC = () => {
  return (
      <div className='patient-page'>
          <SideBar/>
          <UserProfile/>
      </div>
  )
}

export default PatientPage;