import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";

interface Props {
  files: string[];
  onChange: (files: string[]) => void;
}

// There is no backend yet, so we only keep the file names.
export default function FileDropzone({ files, onChange }: Props) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const names = Array.from(list).map((f) => f.name);
    onChange([...files, ...names.filter((n) => !files.includes(n))]);
  };

  return (
    <div>
      <div
        className={`dropzone ${over ? "dropzone--over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <Paperclip size={16} style={{ verticalAlign: "-3px" }} /> Drop a screenshot here or{" "}
        <a onClick={() => inputRef.current?.click()}>browse files</a>
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        {files.length > 0 && (
          <div className="file-chips">
            {files.map((name) => (
              <span key={name} className="file-chip">
                {name}
                <button type="button" className="icon-btn icon-btn--bare" style={{ width: 22, height: 22 }} aria-label={`Remove ${name}`} onClick={() => onChange(files.filter((f) => f !== name))}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
