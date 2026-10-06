function SocialButton({ icon, text }) {
    return (
        <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors md-py-3"
        >
            <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
            <span>{text}</span>
        </button>
    );
}

export default SocialButton;