import DoctorInfo from '../../features/account/DoctorInfo/DoctorInfo';
import MyProfile from '../../features/account/MyProfile/MyProfile';

const DoctorPage = () => {
    return (
        <>
            <MyProfile
                mode={"DOCTOR"}
            />
            <DoctorInfo />
        </>
    );
};

export default DoctorPage;