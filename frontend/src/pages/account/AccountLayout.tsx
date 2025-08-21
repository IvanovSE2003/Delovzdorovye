import { useContext, useEffect, useState } from 'react';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
import RightPanel from '../../features/account/RightPanel/RightPanel';
import SideBar from '../../components/UI/SideBar/SideBar';
import ActivatedEmail from '../auth/ActivatedEmail';
import Loader from '../../components/UI/Loader/Loader';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const AccountLayout:React.FC<AccountLayoutProps> = ({ children }) => {
  const { store } = useContext(Context);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    const checkActivation = async () => {
      await store.checkAuth();
      setActive(store.user.isActivated);
      setIsLoading(false);
    };
    
    checkActivation();
  }, [store.user.isActivated]);

  if (isLoading) {
    return <Loader/>;
  }

  if (!active) {
    return <ActivatedEmail />;
  }

  return (
    <div className="account__main">
      <SideBar menuItems={store.menuItems} />
      <main className='account__content'>
        {children}
      </main>
      <RightPanel />
    </div>
  );
};

export default observer(AccountLayout);