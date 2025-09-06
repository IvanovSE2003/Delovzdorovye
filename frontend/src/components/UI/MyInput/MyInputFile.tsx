import React, { useState, useRef } from "react";
import "./MyInput.scss";

interface FileInputProps {
  id: string;
  label: string;
  onChange: (file: File | null) => void; // теперь принимает один файл или null
  required?: boolean;
  accept?: string;
  className?: string;
}

const MyInputFile: React.FC<FileInputProps> = ({
  id,
  label,
  onChange,
  required = false,
  accept,
  className = "",
}) => {
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onChange(files[0]);
    } else {
      setFileName("");
      onChange(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // предотвращаем срабатывание клика на контейнере
    setFileName("");
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`file-input ${className}`}>
      <input
        id={id}
        ref={fileInputRef}
        type="file"
        className="file-input__input"
        onChange={handleChange}
        required={required}
        accept={accept}
      />

      <div className="file-input__container" onClick={handleClick}>
        <div className="file-input__button">Выбрать файл</div>
        <div className="file-input__text">
          {fileName || label} {/* показываем имя файла или стандартный label */}
        </div>
        {fileName && (
          <button
            type="button"
            className="file-input__clear"
            onClick={handleClear}
            aria-label="Очистить выбор файла"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default MyInputFile;