import { useState, useCallback } from "react";
import "./MyInput.scss";

type InputType = "text" | "email" | "password" | "number" | "tel" | "url" | "date";
type FileInputType = "file";

interface BaseInputProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

interface TextInputProps extends BaseInputProps {
  type?: InputType;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

interface FileInputProps extends BaseInputProps {
  type: FileInputType;
  value?: never; // Запрещаем value для файлов
  onChange: (file: File) => void;
  accept?: string;
}

type MyInputProps = TextInputProps | FileInputProps;

const MyInput: React.FC<MyInputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (props.type === "file") {
        const file = e.target.files?.[0];
        if (file) {
          setFileName(file.name);
          props.onChange(file);
        }
      } else {
        props.onChange(e.target.value);
      }
    },
    [props]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  }, [props]);

  return (
    <div className={`auth__input-group ${isFocused ? "focused" : ""}`}>
      <input
        className={`auth__input ${props.className || ""}`}
        type={props.type || "text"}
        id={props.id}
        value={props.type === "file" ? undefined : props.value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={props.type === "file" ? undefined : props.maxLength}
        required={props.required}
        placeholder={props.placeholder || " "}
        accept={props.type === "file" ? props.accept : undefined}
      />
      <label htmlFor={props.id}>{props.label}</label>
    </div>
  );
};

export default MyInput;