import React, { useState } from "react";
import "./MyInput.scss";

interface FileInputProps {
  id: string;
  label: string;
  onChange: (file: File) => void;
  required?: boolean;
  accept?: string;
  className?: string;
}

const MyInputFile: React.FC<FileInputProps> = ({
  id,
  label,
  onChange,
  required,
  accept,
  className,
}) => {
  const [fileName, setFileName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  return (
    <div className="auth__input-group">
      <input
        id={id}
        type="file"
        className={`auth__input ${className || ""}`}
        onChange={handleChange}
        required={required}
        accept={accept}
      />
      <label htmlFor={id}>{fileName || label}</label>
    </div>
  );
};

export default MyInputFile;
