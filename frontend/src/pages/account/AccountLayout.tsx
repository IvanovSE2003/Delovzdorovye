import { useContext } from 'react';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
import RightPanel from '../../features/account/RightPanel/RightPanel';
import SideBar from '../../components/UI/SideBar/SideBar';
import type { Role } from '../../models/Auth';
import { API_URL } from '../../http';
import { useMessage } from '../../hooks/useMessage';

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

  const {
    countChange,
    countConsult,
    countOtherProblem,
    notificationCount,
  } = useMessage(`${API_URL}/ws`, store.user.id, store.user.role);


  return (
    <div className="account__main">
      <SideBar
        menuItems={store.menuItems}
        role={store.user.role}
        countChange={countChange}
        countConsult={countConsult}
        countOtherProblem={countOtherProblem}
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
        countMessage={notificationCount}
        role={store.user.role}
      />
    </div>
  );
};

export default observer(AccountLayout);