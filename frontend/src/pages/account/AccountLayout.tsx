import { useContext, useEffect, useState } from 'react';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
// import HeaderProfile from '../../components/AccountComponents/HeaderProfile/HeaderProfile';
import RightPanel from '../../features/account/RightPanel/RightPanel';
import SideBar from '../../components/UI/SideBar/SideBar';
import ActivatedEmail from '../auth/ActivatedEmail';

interface AccountLayoutProps {
  menuItems: Array<{ path: string, name: string }>;
  children: React.ReactNode;
}

const AccountLayout = observer(({ menuItems, children }: AccountLayoutProps) => {
  const { store } = useContext(Context);
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    setActive(store.user.isActivated);
  }, [store.user]);

  if (!active) {
    return <ActivatedEmail />;
  }

  return (
    <div className="account__main">
      <SideBar menuItems={menuItems} />
      <main className='account__content'>
        {children}
      </main>
      <RightPanel />
    </div>
  );
});

export default AccountLayout;