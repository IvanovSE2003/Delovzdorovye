import { useState, useCallback } from "react";
import "./MyInput.scss";

type InputType = "text" | "email" | "password" | "number" | "tel" | "url" | "date";

type InputType = "text" | "email" | "password" | "number" | "tel" | "url";

interface MyInputProps {
  type?: InputType;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const MyInput: React.FC<MyInputProps> = ({
  type = "text",
  id,
  label,
  value = "",
  onChange,
  onBlur,
  maxLength,
  required = false,
  className = "",
  placeholder = " ",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  return (
    <div className={`auth__input-group ${isFocused ? "focused" : ""}`}>
      <input
        className={`auth__input ${className}`}
        type={type}
        id={id}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={maxLength}
        required={required}
        placeholder={placeholder}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default MyInput;