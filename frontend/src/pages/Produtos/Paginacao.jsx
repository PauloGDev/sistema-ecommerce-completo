import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MAX_VISIBLE = 5;

const Paginacao = ({ pagina, totalPaginas, mudarPagina }) => {
  if (totalPaginas <= 1) return null;

  const gerarPaginas = () => {
    const paginas = [];
    let inicio = Math.max(1, pagina - Math.floor(MAX_VISIBLE / 2));
    let fim = Math.min(totalPaginas, inicio + MAX_VISIBLE - 1);

    if (fim - inicio < MAX_VISIBLE - 1) {
      inicio = Math.max(1, fim - MAX_VISIBLE + 1);
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }

    return paginas;
  };

  const paginasVisiveis = gerarPaginas();

  return (
    <nav
      className="flex justify-center items-center gap-2 mt-10 text-sm sm:text-base"
      role="navigation"
      aria-label="Paginação"
    >
      {/* Anterior */}
      <button
        disabled={pagina === 1}
        onClick={() => mudarPagina(pagina - 1)}
        aria-label="Página anterior"
        className="disabled:opacity-40 p-2 text-gray-300 rounded hover:bg-gray-700"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Primeira página */}
      {paginasVisiveis[0] > 1 && (
        <>
          <button
            onClick={() => mudarPagina(1)}
            className={`px-3 py-1 rounded ${
              pagina === 1 ? "font-bold text-amber-400" : " hover:bg-gray-700"
            }`}
          >
            1
          </button>
          {paginasVisiveis[0] > 2 && <span className="px-1">...</span>}
        </>
      )}

      {/* Páginas centrais */}
      {paginasVisiveis.map((p) => (
        <button
          key={p}
          onClick={() => mudarPagina(p)}
          aria-current={pagina === p ? "page" : undefined}
          className={`px-3 py-1 rounded ${
            pagina === p
              ? "font-bold text-amber-400 bg-gray-700"
              : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          {p}
        </button>
      ))}

      {/* Última página */}
      {paginasVisiveis[paginasVisiveis.length - 1] < totalPaginas && (
        <>
          {paginasVisiveis[paginasVisiveis.length - 1] < totalPaginas - 1 && (
            <span className="px-1">...</span>
          )}
          <button
            onClick={() => mudarPagina(totalPaginas)}
            className={`px-3 py-1 rounded ${
              pagina === totalPaginas
                ? "font-bold text-amber-400 text-gray-300"
                : "hover:bg-gray-700"
            }`}
          >
            {totalPaginas}
          </button>
        </>
      )}

      {/* Próxima */}
      <button
        disabled={pagina === totalPaginas}
        onClick={() => mudarPagina(pagina + 1)}
        aria-label="Próxima página"
        className="disabled:opacity-40 p-2 rounded text-gray-300 hover:bg-gray-700"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
};

Paginacao.propTypes = {
  pagina: PropTypes.number.isRequired,
  totalPaginas: PropTypes.number.isRequired,
  mudarPagina: PropTypes.func.isRequired,
};

export default Paginacao;
