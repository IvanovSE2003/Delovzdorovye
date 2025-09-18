import './Slider.scss';
import { RouteNames } from '../../../routes';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AnimatedBlock from '../../../components/AnimatedBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { useEffect, useState } from 'react';
import { processError } from '../../../helpers/processError';
import HomeService from '../../../services/HomeService';
import type { InfoBlock } from '../../../models/InfoBlock';

interface SliderProps extends ElementHomePageProps{
  isAuth: boolean;
}

const Slider: React.FC<SliderProps> = ({ role, isAuth }) => {
  const [data, setData] = useState<InfoBlock>({} as InfoBlock);

  // Получение данных
  const fetchSlider = async () => {
    try {
      const response = await HomeService.getContent("slider");
      setData(response.data.contents[0]);
    } catch(e) {
      processError(e, "Ошибка при получении данных слайдера")
    }
  }

  // Получение данных при открытии блока
  useEffect(() => {
    fetchSlider();
  }, [])

  return (
    <AnimatePresence mode="wait">
      <div className="slider">
        <AnimatedBlock className="slider__content">
          <div className="slider__text">
            <h3>
              {data.header}
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