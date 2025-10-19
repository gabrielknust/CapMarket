import { ProductCard } from './/components/ProductCard';

async function getProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Falha ao buscar produtos: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="bg-gray-800">
      <main className="bg-gray-100 min-h-screen rounded-t-2xl p-4 md:p-8">
        <div className="container mx-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-20">
              Nenhum produto encontrado no momento.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}