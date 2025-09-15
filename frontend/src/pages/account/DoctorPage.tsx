import DoctorInfo from '../../features/account/DoctorInfo/DoctorInfo';
import MyProfile from '../../features/account/MyProfile/MyProfile';

const DoctorPage = () => {
    return (
        <>
            <MyProfile
                mode={"DOCTOR"}
            />
            <DoctorInfo 
                type="WRITE"
            />
        </>
    );
};

export default DoctorPage;