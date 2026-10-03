function PropertyCard({ image, alt, kind, title, price, specs }) {
    return (
        <article className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <img className="w-full h-50 object-cover" src={image} alt={alt}/>
            <div className="flex flex-1 flex-col p-4.5">
                <div>
                    <p className="mb-1 text-xs text-smoke-700">{kind}</p>
                    <h3 className="text-lg font-bold leading-snug">{title}</h3>
                </div>
                <p className="mt-3 text-xl font-bold text-smoke-900">{price}</p>
                <hr className="border-0 my-3.5 h-px bg-smoke-300" />
                <ul className="grid grid-cols-3 text-center divide-x divide-smoke-300">
                    {specs.map((spec) => (
                        <li key={spec.label}>
                            <span className="block text-xs uppercase tracking-wide text-smoke-700">{spec.label}</span><span className="block mt-0.5 text-lg font-semibold">{spec.value}</span>
                        </li>
                    ))}
                </ul>
                <hr className="border-0 my-3.5 h-px bg-smoke-300" />
                <a className="p-2.75 mt-auto rounded-md font-semibold text-center transition-colors duration-300 bg-smoke-900 text-smoke-100 hover:bg-smoke-700" href="#">Contactar</a>
            </div>
        </article>
    )
}
export default PropertyCard;
