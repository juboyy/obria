import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldProps = {
  children: ReactNode;
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

export function Field({ children, label, htmlFor, hint, error, required }: FieldProps) {
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? <p className="field__error" id={`${htmlFor}-error`}>{error}</p> : null}
      {!error && hint ? <p className="field__hint" id={`${htmlFor}-hint`}>{hint}</p> : null}
    </div>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`control ${className}`.trim()} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`control control--textarea ${className}`.trim()} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="select-wrap">
      <select className={`control control--select ${className}`.trim()} {...props}>{children}</select>
      <span aria-hidden="true">⌄</span>
    </div>
  );
}
