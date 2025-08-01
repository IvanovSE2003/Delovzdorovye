import React, { useState, useEffect } from 'react';
import './Slider.scss';

interface Slide {
  id: number;
  backgroundImage: string;
  title: string;
  buttonLink: string;
}

interface SliderProps {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
  fadeDuration?: number;
}

const Slider: React.FC<SliderProps> = ({ 
  slides, 
  autoPlay = true, 
  interval = 5000,
  fadeDuration = 300 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  const goToSlide = (index: number) => {
    if (index === currentSlide || isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, fadeDuration);
    
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), interval * 2);
    }
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, fadeDuration);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval); 

    return () => clearInterval(timer);
  }, [currentSlide, isAutoPlaying, interval, fadeDuration]);

  return (
    <div className="slider">
      <div className="slider__container">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ transitionDuration: `${fadeDuration}ms` }}
          >
            <div className="slide__background">
              <img 
                src={slide.backgroundImage} 
                alt="" 
                className="slide__image"
              />
            </div>
            <div className="slide__content">
              <div className="slide__text">
                <h3>{slide.title}</h3>
              </div>
              <div className="slide__button">
                <a 
                  href={slide.buttonLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className='slide__button__text'
                >
                  Подробнее
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="slider__dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`slider__dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;