import { useState } from 'react';

export default function ProductDetails({ product, store, onAddToCart, onContactSeller, primaryColor }) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!product) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-gray-600">Producto no encontrado</p>
      </div>
    );
  }

  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
  const hasStock = product.stock > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 p-8">
        {/* Columna Izquierda - Imágenes */}
        <div className="space-y-4">
          {/* Imagen Principal */}
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">
                📦
              </div>
            )}
          </div>

          {/* Galería de miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha - Información */}
        <div className="flex flex-col space-y-6">
          {/* Categoría */}
          {product.category && (
            <div>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wide rounded-full">
                {product.category}
              </span>
            </div>
          )}

          {/* Nombre */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-4 py-4 border-y border-gray-200">
            <span className="text-4xl font-bold text-gray-900">
              ${Math.round(finalPrice).toLocaleString('es-CL')}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-2xl text-gray-400 line-through">
                  ${Math.round(product.price).toLocaleString('es-CL')}
                </span>
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                  -{product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              hasStock 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <span className="text-xl">{hasStock ? '✅' : '❌'}</span>
              {hasStock ? `En stock (${product.stock} disponibles)` : 'Sin stock'}
            </span>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Descripción</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description || 'Sin descripción disponible'}
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Botones de acción */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => onAddToCart(product)}
              disabled={!hasStock}
              className="w-full py-4 text-white rounded-xl font-bold text-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: hasStock ? primaryColor : undefined }}
            >
              {hasStock ? '🛒 Agregar al Carrito' : 'Sin Stock Disponible'}
            </button>

            {store && (
              <button
                onClick={onContactSeller}
                className="w-full py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                💬 Contactar al Vendedor
              </button>
            )}
          </div>

          {/* Información de la tienda */}
          {store && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold border-2 border-white shadow-md">
                  {store.name[0]}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Vendido por</p>
                <p className="font-bold text-gray-900">{store.name}</p>
                {store.comuna && (
                  <p className="text-xs text-gray-500">📍 {store.comuna}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
