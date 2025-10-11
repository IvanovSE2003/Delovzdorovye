import { useContext } from 'react';
import { Context } from '../../main';
import { observer } from 'mobx-react-lite';
import RightPanel from '../../features/account/RightPanel/RightPanel';
import SideBar from '../../components/UI/SideBar/SideBar';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const { store } = useContext(Context);
  return (
    <div className="account__main">
      <SideBar
        menuItems={store.menuItems}
        role={store.user.role}
        countChange={store.wsCountChange}
        countConsult={store.wsCountConsult}
        countOtherProblem={store.wsCountOtherProblem}
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
        countMessage={store.wsNotificationCount}
        role={store.user.role}
      />
    </div>
  );
};

export default observer(AccountLayout);