import Slider from '../components/UI/Slider/Slider'
import Header from '../components/UI/Header/Header'
import Line from '../components/UI/Line/Line';
import Solutions from '../components/Solutions/Solutions';
import Costs from '../components/Costs/Costs';
import Informations from '../components/Informations/Informations';
import Contacts from '../components/Contacts/Contacts';

const HomePage = () => {
  const slides = [
    {
      id: 1,
      backgroundImage: 'src/assets/images/slides-images/slide1.jpg',
      title: 'Мы открыли уникальный центр функциональной диагностики!',
      buttonLink: 'https://picasso-cfd.ru/'
    },
    {
      id: 2,
      backgroundImage: 'src/assets/images/slides-images/slide2.jpg',
      title: 'Второй слайдер',
      buttonLink: 'https://example.com'
    },
    {
      id: 3,
      backgroundImage: 'src/assets/images/slides-images/slide3.jpg',
      title: 'Третий слайдер',
      buttonLink: 'https://example.com'
    },
  ];

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