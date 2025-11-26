import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import MainHeader from '../components/MainHeader';
import ProductDetails from '../components/ProductDetails';
import ProductReviews from '../components/ProductReviews';
import PromotionalBanner from '../components/PromotionalBanner';

export default function ProductDetailPage() {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductData();
  }, [storeId, productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar tienda pública
      const { data: storeData } = await axios.get(`/stores/${storeId}`);
      setStore(storeData);

      // Cargar productos públicos de la tienda
      const { data: productsData } = await axios.get(`/stores/${storeId}/public-products`);
      
      // Buscar el producto específico
      const foundProduct = productsData.find(p => p._id === productId);
      
      if (!foundProduct) {
        setError('Producto no encontrado');
        return;
      }

      setProduct(foundProduct);
    } catch (err) {
      console.error('Error al cargar producto:', err);
      setError(err.response?.data?.message || 'Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Aquí puedes implementar la lógica del carrito
    // Por ahora solo mostramos un alert
    alert(`${product.name} agregado al carrito (implementar lógica de carrito)`);
  };

  const handleContactSeller = () => {
    // Redirigir a la página de la tienda
    navigate(`/tienda/${storeId}`);
  };

  // Obtener colores de personalización
  const primaryColor = store?.appearance?.colors?.primary || '#3b82f6';
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainHeader subtitle="Cargando..." />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainHeader subtitle="Error" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-gray-900 font-bold text-xl mb-2">Error</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader 
        subtitle={`${store?.name} - ${product?.name}`}
        variant="vitrinex"
      />

      {/* Banner Superior */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <PromotionalBanner position="top" store={store} />
      </div>

      {/* Layout con Sidebars */}
      <div className="w-full px-4 py-10">
        <div className="flex gap-6 max-w-[2000px] mx-auto">
          {/* Sidebar Izquierda */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              <PromotionalBanner position="sidebarLeft" store={store} />
            </div>
          </aside>

          {/* Contenido Principal */}
          <main className="flex-1 min-w-0 max-w-[1400px] mx-auto space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button 
                onClick={() => navigate('/')}
                className="hover:text-blue-600 transition-colors"
              >
                Inicio
              </button>
              <span>/</span>
              <button 
                onClick={() => navigate(`/tienda/${storeId}`)}
                className="hover:text-blue-600 transition-colors"
              >
                {store?.name}
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">{product?.name}</span>
            </div>

            {/* Detalle del Producto */}
            <ProductDetails
              product={product}
              store={store}
              onAddToCart={handleAddToCart}
              onContactSeller={handleContactSeller}
              primaryColor={primaryColor}
            />

            {/* Banner Entre Secciones */}
            <PromotionalBanner position="betweenSections" store={store} />

            {/* Sección de Comentarios */}
            <ProductReviews
              productId={productId}
              storeId={storeId}
            />

            {/* Banner Footer */}
            <PromotionalBanner position="footer" store={store} />

            {/* Botón Volver */}
            <div className="flex justify-center pt-8">
              <button
                onClick={() => navigate(`/tienda/${storeId}`)}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                ← Volver a la Tienda
              </button>
            </div>
          </main>

          {/* Sidebar Derecha */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              <PromotionalBanner position="sidebarRight" store={store} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
