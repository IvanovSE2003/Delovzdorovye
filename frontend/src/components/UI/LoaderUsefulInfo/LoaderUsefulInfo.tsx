import './LoaderUsefulInfo.scss';

interface LoaderUsefulInfoProps {
  className?: string;
}

const LoaderUsefulInfo: React.FC<LoaderUsefulInfoProps> = ({ className="" }) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className={`${className} spinner-circle spinner-circle--first`}></div>
        <div className={`${className} spinner-circle spinner-circle--second`}></div>
        <div className={`${className} spinner-circle spinner-circle--third`}></div>
      </div>
      <p className="loading-text">Загрузка...</p>
    </div>
  );
};

export default LoaderUsefulInfo;