import Slider from '../components/UI/Slider/Slider'
import Header from '../components/UI/Header/Header'
import Line from '../components/UI/Line/Line';
import Solutions from '../components/Solutions/Solutions';
import Costs from '../components/Costs/Costs';
import Informations from '../components/Informations/Informations';
import Contacts from '../components/Contacts/Contacts';

const HomePage = () => {
  return (
    <div>
      <Header />
      <Slider />
      <Solutions />
      <Line />
      <Costs />
      <Informations />
      <Contacts />
    </div>
  )
}

export default HomePage;