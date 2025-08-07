import React from "react";
import "./MySelect.scss";

interface MySelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}

const MySelect: React.FC<MySelectProps> = ({
  value,
  onChange,
  label,
  required = false,
  defaultValue,
  children
}) => {
  return (
    <div className="auth__input-group">
      <select
        value={value}
        id="select"
        onChange={(e) => onChange(e.target.value)}
        className="auth__select"
        defaultValue={defaultValue}
        required={required}
      >
        {children}
      </select>
      <label htmlFor="select"> {label} </label>
    </div>
  );
};

export default MySelect;