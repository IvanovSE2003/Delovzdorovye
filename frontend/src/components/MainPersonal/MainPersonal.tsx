import React from "react";
import './MainPersonal.scss';

const MainPersonal: React.FC = () => {
  return (
    <div className="content">
      <div className="content__form-client">
        <h1 className="form-title">Анкета клиента</h1>
        
        <div className="form-section">
          <h2 className="section-title">Общая информация</h2>
          
          <div className="form-field">
            <label>Хронические заболевания:</label>
            <input type="text" className="form-input" placeholder="Введите информацию" />
          </div>
          
          <div className="form-field">
            <label>Перенесенные операции (год и что именно):</label>
            <input type="text" className="form-input" placeholder="Введите информацию" />
          </div>
          
          <div className="form-field">
            <label>Госпитализации за последние 2 года (причина):</label>
            <input type="text" className="form-input" placeholder="Введите информацию" />
          </div>
          
          <div className="form-field">
            <label>Аллергии (лекарства, продукты, другие):</label>
            <input type="text" className="form-input" placeholder="Введите информацию" />
          </div>
          
          <div className="form-field">
            <label>Регулярные лекарства (название, доза):</label>
            <input type="text" className="form-input" placeholder="Введите информацию" />
          </div>
        </div>
        
        <div className="form-section">
          <h2 className="section-title">Анализы и обследования</h2>
          
          <div className="form-field">
            <label>Какие анализы сдавали за последний год? (можно прикрепить файлы)</label>
            <div className="file-upload">
              <input type="file" id="analyses" className="file-input" />
              <label htmlFor="analyses" className="file-label">Выберите файл</label>
            </div>
          </div>
          
          <div className="form-field">
            <label>Какие исследования делали за последний год? (можно прикрепить файлы)</label>
            <div className="file-upload">
              <input type="file" id="research" className="file-input" />
              <label htmlFor="research" className="file-label">Выберите файл</label>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2 className="section-title">Дополнительно</h2>
          
          <div className="form-field">
            <label>Наследственные заболевания:</label>
            <input type="text" className="form-input" placeholder="Введите информацию" />
          </div>
        </div>
        
        <button className="submit-button">Сохранить</button>
      </div>
    </div>
  );
};

export default MainPersonal;