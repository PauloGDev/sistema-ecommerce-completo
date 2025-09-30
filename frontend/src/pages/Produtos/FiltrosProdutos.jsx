const FiltrosProdutos = ({
  categoriasDisponiveis,
  categoriasSelecionadas,
  toggleCategoria,
  limpar,
}) => (
  <div className="flex flex-col items-center gap-6 mb-10">
    <div className="flex items-center justify-center flex-wrap gap-4 text-sm">
      {categoriasDisponiveis.map((cat) => (
        <button
          key={cat}
          onClick={() => toggleCategoria(cat)}
          className={`px-4 py-2 rounded-full border transition-all duration-300 ${
            categoriasSelecionadas.includes(cat)
              ? "bg-gray-200 text-gray-950 border-gray-400"
              : "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
          }`}
        >
          {cat}
        </button>
      ))}
      {categoriasSelecionadas.length > 0 && (
        <button
          onClick={limpar}
          className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
        >
          Limpar
        </button>
      )}
    </div>
  </div>
);

export default FiltrosProdutos;
