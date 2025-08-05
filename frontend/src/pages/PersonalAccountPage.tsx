import SideBar from '../components/UI/SideBar/SideBar';
import Timer from '../components/UI/Timer/Timer';
import MainPersonal from '../components/MainPersonal/MainPersonal';
import UserProfile from '../components/UI/UserProfile/UserProfile';
import React from 'react';

const PersonalAccount: React.FC = () => {
  return (
    <div className='account-wrapper'>
        <SideBar />
        <div className='account-main'>
            <UserProfile />
            <MainPersonal />
        </div>
        <Timer />
    </div>
  )
}

export default PersonalAccount;