import { useContext, useEffect, useState } from 'react';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
import RightPanel from '../../features/account/RightPanel/RightPanel';
import SideBar from '../../components/UI/SideBar/SideBar';
import Loader from '../../components/UI/Loader/Loader';
import BlockedAccount from './BlockedAccount';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const AccountLayout:React.FC<AccountLayoutProps> = ({ children }) => {
  const { store } = useContext(Context);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkActivation = async () => {
      await store.checkAuth();
      setIsLoading(false);
    };
    
    checkActivation();
  }, [store.user.isActivated]);

  if(store.user.isBlocked) return <BlockedAccount/>

  if (isLoading) return <Loader/>;

  return (
    <div className="account__main">
      <SideBar menuItems={store.menuItems} />
      <main className='account__content'>
        {children}
      </main>
      <RightPanel 
        role={store.user.role}
      />
    </div>
  );
};

export default observer(AccountLayout);