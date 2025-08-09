import React, { useState, useEffect } from 'react';
import './Slider.scss';
import { RouteNames } from '../../../routes';
import { Link } from 'react-router-dom';

interface Slide {
  id: number;
  backgroundImage: string;
  title: string;
  buttonLink: string;
}

// interface SliderProps {
//   slides: Slide[];
//   autoPlay?: boolean;
//   interval?: number;
//   fadeDuration?: number;
// }

const Slider: React.FC = () => {
  // const [currentSlide, setCurrentSlide] = useState<number>(0);
  // const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  // const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(autoPlay);

  // const goToSlide = (index: number) => {
  //   if (index === currentSlide || isTransitioning) return;

  //   setIsTransitioning(true);
  //   setTimeout(() => {
  //     setCurrentSlide(index);
  //     setIsTransitioning(false);
  //   }, fadeDuration);

  //   if (isAutoPlaying) {
  //     setIsAutoPlaying(false);
  //     setTimeout(() => setIsAutoPlaying(true), interval * 2);
  //   }
  // };

  // const nextSlide = () => {
  //   if (isTransitioning) return;

  //   setIsTransitioning(true);
  //   setTimeout(() => {
  //     setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  //     setIsTransitioning(false);
  //   }, fadeDuration);
  // };

  // useEffect(() => {
  //   if (!isAutoPlaying) return;

  //   const timer = setInterval(() => {
  //     nextSlide();
  //   }, interval);

  //   return () => clearInterval(timer);
  // }, [currentSlide, isAutoPlaying, interval, fadeDuration]);

  return (
    <div className="slider container">
      <div className="container__box">
        <div style={{ transitionDuration: '500ms' }}>
          <div className="slider__content">
            <div className="slider__text">
              <h3>
                «Дело в здоровье» <br />
                – сервис онлайн-консультаций по решению проблем со здоровьем.
              </h3>
            </div>
            <div className="slider__button">
              <Link to={RouteNames.LOGIN}>
                <a
                  href="#"
                  target="_blank"
                >
                  Записаться на консультацию
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;