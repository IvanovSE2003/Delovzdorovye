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
  role: Role;
}

const HomePage = () => {
  const { store } = useContext(Context);

  return (
    <div>
      <Header />
      <Slider />
      <Solutions />
      <div className='line'></div>
      <Costs 
        role={store.user.role}
      />
      <Informations
        role={store.user.role}
      />
      <Contacts
        role={store.user.role}
      />
    </div>
  )
}

export default observer(HomePage);