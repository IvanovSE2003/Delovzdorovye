import { useState } from 'react';
import { URL } from '../../../http';
import './CheckBox.scss'

interface AgreeCheckBoxProps {
  id: string,
  onAgreementChange: (isChecked: boolean) => void;
  onLinkClick: () => void;
}

const AgreeCheckBox: React.FC<AgreeCheckBoxProps> = ({ id, onAgreementChange, onLinkClick }) => {
  const [isChecked, setIsChecked] = useState(true);

  // Изменение чек-бокса
  const handleCheckboxChange = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onAgreementChange?.(newValue);
  };

  // Обработка нажатий на клавиши 'ENTER' или пробела
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
          Я согласен с
          <span
            className="agreement__link"
            onClick={onLinkClick}
            role="button"
            tabIndex={0}
          >
            <a target="_blank" href={`${URL}/terms.pdf`}>
              условиями пользовательского соглашения
            </a>
          </span>
          и даю согласие на обработку персональных данных
        </div>
      </div>
    </div>
  );
};

export default AgreeCheckBox;