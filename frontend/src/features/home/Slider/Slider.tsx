import './Slider.scss';
import { RouteNames } from '../../../routes';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AnimatedBlock from '../../../components/AnimatedBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { useEffect } from 'react';
import { processError } from '../../../helpers/processError';

interface SliderProps extends ElementHomePageProps{
  isAuth: boolean;
}

const Slider: React.FC<SliderProps> = ({ role, isAuth }) => {

  const fetchSlider = async () => {
    try {

    } catch(e) {
      processError(e, "Ошибка при получении данных слайдера")
    }
  }

  useEffect(() => {
    fetchSlider();
  }, [])

  return (
    <AnimatePresence mode="wait">
      <div className="slider">
        <AnimatedBlock className="slider__content">
          <div className="slider__text">
            <h3>
              {}
              «Дело в здоровье» <br />
              – сервис онлайн-консультаций по решению проблем со здоровьем.
            </h3>
          </div>
          <div className="my-button">
            <Link to={isAuth ? RouteNames.MAINPAT : RouteNames.LOGIN}>
              Записаться на консультацию
            </Link>
          </div>
        </AnimatedBlock>
      </div>
    </AnimatePresence >
  );
};

export default Slider;