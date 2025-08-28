import React, { useState } from 'react';
import './CheckBox.scss'
import { URL } from '../../../http';

interface AgreeCheckBoxProps {
  id: string,
  onAgreementChange?: (isChecked: boolean) => void;
  agreementText?: string;
  linkText?: string;
  onLinkClick?: () => void;
  defaultChecked?: boolean;
}

const AgreeCheckBox: React.FC<AgreeCheckBoxProps> = ({
  id,
  onAgreementChange,
  agreementText = 'Я согласен с условиями пользовательского соглашения и даю согласие на обработку персональных данных',
  linkText = ' условиями пользовательского соглашения',
  onLinkClick,
  defaultChecked = true
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

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
          id={id}
          className={`agreement__custom-checkbox ${isChecked ? 'checked' : ''}`}
          onClick={handleCheckboxChange}
          onKeyDown={handleKeyDown}
          role="checkbox"
          aria-checked={isChecked}
          tabIndex={0}
        />
        
        <div className="agreement__text">
          {agreementText.split(linkText)[0]}
          <span 
            className="agreement__link" 
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
            <a target="_blank" href={`${URL}/terms.pdf`}>{linkText}</a>
          </span>
          {agreementText.split(linkText)[1]}
        </div>
      </div>
    </div>
  );
};

export default AgreeCheckBox;