import { useContext } from 'react';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
import RightPanel from '../../features/account/RightPanel/RightPanel';
import SideBar from '../../components/UI/SideBar/SideBar';
import BlockedAccount from './BlockedAccount';
import type { Role } from '../../models/Auth';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export interface MenuItem {
  label: string;
  path: string;
  notifications?: number;
  roles: Role[];
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const { store } = useContext(Context);

  if (store.user.isBlocked) return <BlockedAccount />

  return (
    <div className="account__main">
      <SideBar menuItems={store.menuItems}/>
      <main className='account__content'>
        {children}
      </main>
      <RightPanel
        countMessage={store.countMessage}
        role={store.user.role}
      />
    </div>
  );
};

export default observer(AccountLayout);