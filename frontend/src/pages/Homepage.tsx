import Slider from '../components/Slider/Slider'
import Header from '../components/Header/Header'

const Homepage = () => {
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
            <Slider slides={slides} interval={10000}/>
            <div>
                Еще контент
            </div>
        </div>
    )
}

export default Homepage;