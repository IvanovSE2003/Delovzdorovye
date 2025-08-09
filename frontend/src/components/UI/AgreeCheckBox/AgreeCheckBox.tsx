import React, { useState } from 'react';
import './AgreeCheckBox.scss'

interface AgreeCheckBoxProps {
  onAgreementChange?: (isChecked: boolean) => void;
  agreementText?: string;
  linkText?: string;
  onLinkClick?: () => void;
}

const AgreeCheckBox: React.FC<AgreeCheckBoxProps> = ({
  onAgreementChange,
  agreementText = 'Я согласен с условиями пользовательского соглашения и даю согласие на обработку персональных данных',
  linkText = ' условиями пользовательского соглашения',
  onLinkClick
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
    <div className="agreement">
      <div className="agreement__container">
        <div
          className={`agreement__custom-checkbox ${isChecked ? 'checked' : ''}`}
          onClick={handleCheckboxChange}
          onKeyDown={handleKeyDown}
          role="checkbox"
          aria-checked={isChecked}
        />
        
        <div className="agreement__text">
          {agreementText.split(linkText)[0]}
          <span 
            className="agreement__link" 
            onClick={onLinkClick}
            role="button"
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onLinkClick?.();
              }
            }}
          >
            {` ${linkText}`}
          </span>
          {agreementText.split(linkText)[1]}
        </div>
      </div>
    </div>
  );
};

export default AgreeCheckBox;