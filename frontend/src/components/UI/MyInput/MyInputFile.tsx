import React, { useState, useRef, useEffect } from "react";
import "./MyInput.scss";
import { URL } from "../../../http";

interface FileInputProps {
  id: string;
  label: string;
  value?: string | File;
  onChange: (file: File | null) => void;
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
  value,
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
    e.stopPropagation();
    setFileName("");
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (typeof value === "string") {
      setFileName(value.split("/").pop() || "");
    } else if (value instanceof File) {
      setFileName(value.name);
    } else {
      setFileName("");
    }
  }, [value]);

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
          {fileName ? (
            <a
              target="_blank"
              href={`${URL}/${fileName}`}
              onClick={(e) => e.stopPropagation()}
              title="Посмотреть файл"
            >
              {`${label} : ${fileName}`}
            </a>
          ) : (
            label
          )}
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