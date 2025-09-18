import './Slider.scss';
import { RouteNames } from '../../../routes';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AnimatedBlock from '../../../components/AnimatedBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { useEffect, useState } from 'react';
import { processError } from '../../../helpers/processError';
import HomeService from '../../../services/HomeService';
import ShowError from '../../../components/UI/ShowError/ShowError';

interface SliderProps extends ElementHomePageProps {
  isAuth: boolean;
}

const Slider: React.FC<SliderProps> = ({ role, isAuth }) => {
  const [title, setTitle] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });
  const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });

  // Получение данных
  const fetchSlider = async () => {
    try {
      const response = await HomeService.getContent("slider");
      setTitle(response.data.contents[0].text || "Пока нет данных");
    } catch (e) {
      processError(e, "Ошибка при получении данных слайдера");
    }
  }

  // Сохраниние данных
  const saveChange = async () => {
    try {
      await HomeService.editContent("slider", { id: Date.now(), text: title });
      setMessage({ id: Date.now(), message: "Данные успешно сохранены" });
      setIsEditing(false)
    } catch (e) {
      processError(e, "Ошибка при сохрании данных", setError);
    }
  }

  // Получение данных при открытии блока
  useEffect(() => {
    fetchSlider();
  }, [])

  // Основной рендер
  return (
    <AnimatePresence mode="wait">
      <div className="slider">
        <AnimatedBlock className="slider__content">
          <div className="slider__text">
            <ShowError msg={error} />
            <ShowError msg={message} mode="MESSAGE" />
            <br/>
            {isEditing ? (
              <textarea
                className='slider__textarea'
                placeholder='Заголовок'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            ) : (
              <h3>
                {title || "Пока нет данных"}
              </h3>
            )}
          </div>
          {title && !isEditing && (
            <div className="my-button">
              <Link to={isAuth ? RouteNames.MAINPAT : RouteNames.LOGIN}>
                Записаться на консультацию
              </Link>
            </div>
          )}
          {role === "ADMIN" && !isEditing && (
            <button
              className='my-button'
              onClick={() => setIsEditing(true)}
            >
              Редактировать
            </button>
          )}
          {isEditing && (
            <>
              <button
                className='my-button'
                onClick={saveChange}
              >
                Сохранить
              </button>
              <button
                className='neg-button'
                onClick={() => setIsEditing(false)}
              >
                Отменить
              </button>
            </>
          )}
        </AnimatedBlock>
      </div >
    </AnimatePresence >
  );
};

export default Slider;