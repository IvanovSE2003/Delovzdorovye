import Slider from '../components/UI/Slider/Slider'
import Header from '../components/UI/Header/Header'

import Solutions from '../components/HomeComponents/Solutions/Solutions';
import Costs from '../components/HomeComponents/Costs/Costs';
import Informations from '../components/HomeComponents/Informations/Informations';
import Contacts from '../components/HomeComponents/Contacts/Contacts';

const HomePage = () => {
  return (
    <div>
      <Header />
      <Slider />
      <Solutions />
      <div className='line'></div>
      <Costs />
      <Informations />
      <Contacts />
    </div>
  )
}

export default HomePage;