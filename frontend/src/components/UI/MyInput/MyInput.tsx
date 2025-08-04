import { useState } from "react";
import "./MyInput.scss";

interface MyInputProps {
  type?: string;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
}

const MyInput: React.FC<MyInputProps> = ({
  type = "text",
  id,
  label,
  value,
  onChange,
  onBlur,
  maxLength,
  required = false,
  placeholder = " ",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`input-group ${isFocused ? "focused" : ""}`}>
      <input
        className="auth__input"
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        maxLength={maxLength}
        required={required}
        placeholder={placeholder}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default MyInput;