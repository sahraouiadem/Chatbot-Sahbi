import React from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  icon?: React.ReactNode;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  icon,
  type = 'text',
}) => (
  <div className="mb-4">
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
      {icon && <span className="text-teal-600">{icon}</span>}
      {label}
    </label>
    {multiline ? (
      <textarea
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all min-h-[80px] text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default InputField;
