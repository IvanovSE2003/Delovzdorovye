import './Slider.scss';
import { RouteNames } from '../../../routes';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';

import AnimatedBlock from '../../AnimatedBlock';

const Slider: React.FC = () => {
  return (
    <AnimatePresence mode="wait">
      <div className="slider container">
        <div className="container__box">
          <AnimatedBlock>
            <div className="slider__content">
              <div className="slider__text">
                <h3>
                  «Дело в здоровье» <br />
                  – сервис онлайн-консультаций по решению проблем со здоровьем.
                </h3>
              </div>
              <div className="slider__button">
                <Link to={RouteNames.LOGIN}>
                    Записаться на консультацию
                </Link>
              </div>
            </div>
          </AnimatedBlock>
        </div>
      </div>
    </AnimatePresence >
  );
};

export default Slider;