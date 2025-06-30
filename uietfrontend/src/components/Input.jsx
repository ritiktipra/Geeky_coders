const InputField = ({ label, type, name, value, onChange, required = true }) => (
  <div className="mb-4">
    <label className="block mb-1 font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none"
    />
  </div>
);

export default InputField;
