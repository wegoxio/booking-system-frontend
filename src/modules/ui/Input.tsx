import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  containerClassName?: string;
};

export default function Input({
  label,
  id,
  name,
  className = "",
  containerClassName = "",
  ...props
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div className={containerClassName}>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`bg-gray-50 border border-gray-300 rounded-lg text-gray-600 w-full p-2.5 ${className}`.trim()}
        {...props}
      />
    </div>
  );
}
