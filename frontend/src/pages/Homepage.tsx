import Header from '../features/home/Header/Header'
import Slider from '../features/home/Slider/Slider'
import Solutions from '../features/home/Solutions/Solutions';
import Costs from '../features/home/Costs/Costs';
import Informations from '../features/home/Informations/Informations';
import Contacts from '../features/home/Contacts/Contacts';

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