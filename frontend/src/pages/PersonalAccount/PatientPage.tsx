import MainPersonal from '../../components/MainPersonal/MainPersonal';
import UserProfile from '../../components/UI/UserProfile/UserProfile';

const PatientPage: React.FC = () => {
  return (
      <div className='patient-page'>
        <UserProfile />
        {/* <MainPersonal /> */}
      </div>
  )
}

export default PatientPage;