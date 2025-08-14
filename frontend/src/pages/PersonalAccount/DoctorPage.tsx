import SideBar from "../../components/UI/SideBar/SideBar";
import UserProfile from "../../components/UI/UserProfile/UserProfile";
import DoctorInfo from "./DoctorInfo/DoctorInfo";

const DoctorPage = () => {
    return (
        <div className='patient-page'>
            <SideBar />
            <div>
                <UserProfile />
                <DoctorInfo />
            </div>
        </div>

    )
}

export default DoctorPage;