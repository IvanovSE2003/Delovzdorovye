import React from "react";
import "./LoginSkeleton.scss";

const LoginSkeleton: React.FC = () => {
  return (
    <div className="auth__container">
      <div className="auth__form skeleton">
        <div className="skeleton__input-container">
          <div className="skeleton__label"></div>
          <div className="skeleton__input"></div>
        </div>
        
        <div className="skeleton__button"></div>
        
        <div className="skeleton__links">
          <div className="skeleton__link"></div>
          <div className="skeleton__link"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginSkeleton;