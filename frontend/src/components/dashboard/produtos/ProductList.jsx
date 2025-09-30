import ProductCard from "./ProductCard";

const ProductList = ({ produtos, onChange, onEdit, loading }) => {
  if (loading) return <p>Carregando...</p>;

  if (produtos.length === 0)
    return <p className="text-gray-400 text-center mt-12">Nenhum produto encontrado.</p>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {produtos.map((p) => (
        <ProductCard key={p.id} produto={p} onChange={onChange} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default ProductList;
