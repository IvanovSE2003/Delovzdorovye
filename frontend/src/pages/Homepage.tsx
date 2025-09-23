import Header from '../features/home/Header/Header'
import Slider from '../features/home/Slider/Slider'
import Solutions from '../features/home/Solutions/Solutions';
import Costs from '../features/home/Costs/Costs';
import Informations from '../features/home/Informations/Informations';
import Contacts from '../features/home/Contacts/Contacts';
import { useContext } from 'react';
import { Context } from '../main';
import { observer } from 'mobx-react-lite';
import type { Role } from '../models/Auth';

export interface ElementHomePageProps {
  role: Role | null;
}

const Homepage = () => {
  const { store } = useContext(Context);
  const userRole = store.user ? store.user.role : null;

  // Основной рендер
  return (
    <div>
      <Header 
        isAuth={store.isAuth}
        role={store.user.role}
      />
      <Slider 
        role={userRole}
        isAuth={store.isAuth}
      />
      <Solutions 
        role={userRole}
      />

      <div className='line'/>

      <Costs 
        role={userRole}
      />
      <Informations
        role={userRole}
      />
      <Contacts
        role={userRole}
      />
    </div>
  )
}

export default observer(Homepage);