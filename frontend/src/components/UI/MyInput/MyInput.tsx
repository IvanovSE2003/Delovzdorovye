import React, { useState } from "react";
import "./MyInput.scss";

type InputType = "text" | "email" | "password" | "number" | "tel" | "url";

interface MyInputProps {
  id: string;
  label: string;
  type?: InputType;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const MyInput: React.FC<MyInputProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  className,
  maxLength,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`auth__input-group ${isFocused ? "focused" : ""}`}>
      <input
        id={id}
        name={id}
        type={type}
        className={`auth__input ${className || ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        title={label}
        required={required}
        placeholder={placeholder || " "}
        maxLength={maxLength}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default MyInput;
