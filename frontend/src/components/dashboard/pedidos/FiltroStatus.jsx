const FiltroStatus = ({ status, setStatus, setPage }) => {
  const statuses = ["", "PENDENTE", "PAGO", "ENVIADO", "CONCLUIDO", "CANCELADO"];

  return (
    <div className="mb-4 flex gap-2 flex-wrap">
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => {
            setStatus(s);
            setPage(0);
          }}
          className={`px-4 py-2 rounded-md ${
            status === s
              ? "bg-amber-500 text-black"
              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          }`}
        >
          {s === "" ? "Todos" : s}
        </button>
      ))}
    </div>
  );
};

export default FiltroStatus;
