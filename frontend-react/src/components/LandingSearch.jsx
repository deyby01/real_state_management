const searchFields = [
    { id: "operation", label: "Operación", options: ["Arriendo", "Venta"] },
    { id: "type", label: "Tipo", options: ["Departamento", "Casa", "Oficina", "Local comercial"] },
    { id: "commune", label: "Comuna", options: ["Santiago", "Providencia", "Las Condes", "Ñuñoa"] },
]

function Search() {
    return (
        <section className="max-w-[1000px] mx-auto px-5 pb-15">
            <form className="flex gap-3.75 p-5 bg-smoke-100 rounded-lg shadow-lg -mt-10 relative items-end">

                {searchFields.map((field) => (
                    <div key={field.id} className="flex flex-1 flex-col gap-1.5">
                        <label className="text-xs font-semibold text-smoke-700" htmlFor={field.id}>{field.label}</label>
                        <select className="py-2.5 px-3 border border-smoke-300 rounded-md bg-white text-ink cursor-pointer" name={field.id} id={field.id}>
                            {field.options.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                ))}

                <button className="flex items-center gap-2 font-semibold py-2.75 px-6 border border-smoke-300 bg-smoke-900 text-smoke-100 rounded-md cursor-pointer hover:bg-smoke-700 transition-colors duration-300" type="submit">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    Buscar
                </button>
            </form>
        </section>
    )
}
export default Search;
