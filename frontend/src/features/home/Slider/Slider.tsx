import './Slider.scss';
import { RouteNames } from '../../../routes';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AnimatedBlock from '../../../components/AnimatedBlock';
import { useContext } from 'react';
import { Context } from '../../../main';

const Slider: React.FC = () => {
  const { store } = useContext(Context);

  return (
    <AnimatePresence mode="wait">
      <div className="slider">
        <AnimatedBlock className="slider__content">
          <div className="slider__text">
            <h3>
              «Дело в здоровье» <br />
              – сервис онлайн-консультаций по решению проблем со здоровьем.
            </h3>
          </div>
          <div className="my-button">
            <Link to={store.isAuth ? RouteNames.MAINPAT : RouteNames.LOGIN}>
              Записаться на консультацию
            </Link>
          </div>
        </AnimatedBlock>
      </div>
    </AnimatePresence >
  );
};

export default Slider;