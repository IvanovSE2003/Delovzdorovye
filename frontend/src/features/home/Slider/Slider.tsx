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
import ContentLoader from 'react-content-loader';

interface SliderProps extends ElementHomePageProps {
  isAuth: boolean;
}

const TYPE = "slider";
const Slider: React.FC<SliderProps> = ({ role, isAuth }) => {
  const [title, setTitle] = useState<string>("");
  const [titleId, setTitleId] = useState<number>(Date.now());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });
  const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });
  const [loading, setLoading] = useState<boolean>(false);

  // Получение данных
  const fetchSlider = async () => {
    try {
      setLoading(true);
      const response = await HomeService.getContent(TYPE);
      setTitle(response.data.contents[0].text || "Пока нет данных");
      setTitleId(response.data.contents[0].id);
    } catch (e) {
      processError(e, "Ошибка при получении данных слайдера");
    } finally {
      setLoading(false);
    }
  }

  // Сохраниние данных
  const saveChange = async () => {
    let response;

    try {
      setLoading(true);
      if (!title?.trim()) {
        setError({ id: Date.now(), message: "Заголовок не может быть пустым" });
        setLoading(false);
        return;
      }

      if (titleId) {
        try {
          response = await HomeService.editContent(TYPE, {
            id: titleId,
            text: title.trim()
          });

          // Если успешно обновили
          if (response.data.success) {
            setMessage({ id: Date.now(), message: response.data.message });
            setIsEditing(false);
            setLoading(false);
            return;
          }
        } catch (editError) {
          console.warn("Не удалось обновить запись, пробуем создать новую:", editError);
        }
      }

      response = await HomeService.addContent(TYPE, {
        id: Date.now(),
        text: title.trim()
      });

      setMessage({ id: Date.now(), message: response.data.message });

    } catch (e) {
      processError(e, "Ошибка при сохранении данных: ", setError);
    } finally {
      setIsEditing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlider();
  }, [])

  if (loading) return (
    <div className="slider">
      <AnimatedBlock className="slider__content">
        <div className="slider__text">
          <ContentLoader
            speed={2}
            width={710}
            height={304}
            viewBox="0 0 710 304"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="10" rx="11" ry="11" width="450" height="36" />
            <rect x="0" y="56" rx="11" ry="11" width="710" height="27" />
            <rect x="0" y="93" rx="11" ry="11" width="710" height="27" />
            <rect x="0" y="140" rx="11" ry="11" width="320" height="35" />
            <rect x="0" y="184" rx="11" ry="11" width="320" height="35" />
          </ContentLoader>
        </div>
      </AnimatedBlock>
    </div>
  )

  return (
    <AnimatePresence mode="wait">
      <div className="slider">
        <AnimatedBlock className="slider__content">
          <div className="slider__text">
            <ShowError msg={error} />
            <ShowError msg={message} mode="MESSAGE" />
            <br />
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