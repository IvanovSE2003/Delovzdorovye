import { useContext } from 'react';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
import RightPanel from '../../features/account/RightPanel/RightPanel';
import SideBar from '../../components/UI/SideBar/SideBar';
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

  return (
    <div className="account__main">
      <SideBar
        menuItems={store.menuItems}
        role={store.user.role}
      />
      {store.user.isBlocked ? (
        <main className='account__content'>
          <h1 className="account-blocked__title">Ваш аккаунт заблокирован!</h1>
          <button
            className='account-blocked__button'
            onClick={async () => await store.logout()}
          >
            Выйти из аккаунта
          </button>
        </main>
      ) : (
        <main className='account__content'>
          {children}
        </main>
      )}
      <RightPanel
        countMessage={store.countMessage}
        role={store.user.role}
      />
    </div>
  );
};

export default observer(AccountLayout);