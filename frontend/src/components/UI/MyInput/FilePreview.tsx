import React from "react";
import "./MyInput.scss";

interface FilePreviewProps {
  files: File[];
  type: "DIPLOMA"|"LICENSE";
  onRemove?: (index: number, type: "DIPLOMA"|"LICENSE") => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemove, type }) => {
  if (files.length === 0) return null;

  return (
    <div className="file-preview">
      <div className="file-preview__list">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="file-preview__item">
            {file.type.startsWith("image/") ? (
              <img 
                src={URL.createObjectURL(file)} 
                alt={file.name}
                className="file-preview__image"
              />
            ) : (
              <div className="file-preview__icon">📄</div>
            )}
            
            {onRemove && (
              <button 
                className="file-preview__remove"
                onClick={() => onRemove(index, type)}
                aria-label="Удалить файл"
              >
                ×
              </button>
            )}
            
            <div className="file-preview__name">{file.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;