import SideBar from '../components/SideBar/SideBar';
import Timer from '../components/Timer/Timer';
import MainPersonal from '../components/MainPersonal/MainPersonal';
import UserProfile from '../components/UserProfile/UserProfile';
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