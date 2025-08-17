import './Loader.scss';

const Loader: React.FC = () => {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__container">
        <div className="loading-spinner__dot loading-spinner__dot--1"></div>
        <div className="loading-spinner__dot loading-spinner__dot--2"></div>
        <div className="loading-spinner__dot loading-spinner__dot--3"></div>
      </div>
      <p className="loading-spinner__text">Загрузка...</p>
    </div>
  );
};

export default Loader;