import React, { useState, useRef } from "react";
import "./MyInput.scss";

interface FileInputProps {
  id: string;
  label: string;
  onChange: (files: File[]) => void; // теперь всегда массив
  required?: boolean;
  accept?: string;
  className?: string;
  multiple?: boolean;
}

const MyInputFile: React.FC<FileInputProps> = ({
  id,
  label,
  onChange,
  required = false,
  accept,
  className = "",
  multiple = false,
}) => {
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setFileName(
        multiple ? `Выбрано файлов: ${files.length}` : files[0].name
      );
      onChange(multiple ? fileList : [fileList[0]]);
    } else {
      setFileName("");
      onChange([]); // возвращаем пустой массив
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
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
        multiple={multiple}
      />

      <div className="file-input__container" onClick={handleClick}>
        <div className="file-input__button">Выбрать файлы</div>
        <div className="file-input__text">{label}</div>
      </div>
    </div>
  );
};

export default MyInputFile;
