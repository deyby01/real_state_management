/**
 * Labeled input of the login and register forms. Any extra prop (name, value,
 * onChange, required, autoComplete...) goes straight to the <input>, so the
 * form can control it.
 */
function InputField({ label, ...props }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                <input
                    {...props}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
            </label>
        </div>
    );
}

export default InputField;
