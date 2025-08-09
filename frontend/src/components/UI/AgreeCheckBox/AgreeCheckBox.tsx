import React, { useState } from 'react';
import './AgreeCheckBox.scss'

interface AgreeCheckBoxProps {
  onAgreementChange?: (isChecked: boolean) => void;
  agreementText?: string;
  linkText?: string;
  onLinkClick?: () => void;
  buttonText?: string;
}

const AgreeCheckBox: React.FC<AgreeCheckBoxProps> = ({
  onAgreementChange,
  agreementText = 'Я согласен с условиями пользовательского соглашения и даю согласие на обработку персональных данных',
  linkText = 'условиями пользовательского соглашения',
  onLinkClick,
  buttonText = 'Продолжить'
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onAgreementChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleCheckboxChange();
    }
  };

  return (
    <form className="agreement-form">
      <div className="agreement-container">
        <div
          tabIndex={0}
          className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
          onClick={handleCheckboxChange}
          onKeyDown={handleKeyDown}
          role="checkbox"
          aria-checked={isChecked}
        />
        
        <div className="agreement-text">
          {agreementText.split(linkText)[0]}
          <span 
            className="agreement-link" 
            onClick={onLinkClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onLinkClick?.();
              }
            }}
          >
            {linkText}
          </span>
          {agreementText.split(linkText)[1]}
        </div>
      </div>
    </form>
  );
};

export default AgreeCheckBox;