import './LoaderUsefulInfo.scss';

const LoaderUsefulInfo: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-text">Загрузка...</p>
    </div>
  );
};

export default LoaderUsefulInfo;