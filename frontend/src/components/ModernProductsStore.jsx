// src/components/ModernProductsStore.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listStoreProductsPublic, createStoreOrder } from "../api/store";
import CustomerChatModal from "./CustomerChatModal";

export default function ModernProductsStore({ store, appearance }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name | price-asc | price-desc | newest
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null); // 🆕 ID del pedido creado
  const [showChatModal, setShowChatModal] = useState(false); // 🆕 Modal de chat

  useEffect(() => {
    loadProducts();
  }, [store._id]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await listStoreProductsPublic(store._id);
      setProducts(Array.isArray(data) ? data.filter(p => p.isActive) : []);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Extraer categorías únicas
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  // Función auxiliar para calcular precio final
  const getFinalPrice = (product) => {
    return product.discount > 0 
      ? product.price * (1 - product.discount / 100) 
      : product.price;
  };

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    // Ordenar
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
        break;
      case "price-desc":
        filtered.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default: // name
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === product._id 
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: Math.min(quantity, product.stock) }]);
    }
    setShowCart(true);
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const product = products.find(p => p._id === productId);
      setCart(cart.map(item => 
        item._id === productId 
          ? { ...item, quantity: Math.min(quantity, product?.stock || 999) }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (getFinalPrice(item) * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (!checkoutForm.customerName || !checkoutForm.customerEmail || !checkoutForm.customerPhone) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setSubmitting(true);
      const orderItems = cart.map(item => ({
        product: item._id,
        name: item.name,
        price: getFinalPrice(item),
        quantity: item.quantity,
      }));

      const response = await createStoreOrder(store._id, {
        ...checkoutForm,
        items: orderItems,
        total: cartTotal,
      });

      // 🆕 Guardar ID del pedido creado
      setCreatedOrderId(response.data._id);
      setOrderSuccess(true);
      setCart([]);
      
      // 🔔 Disparar evento para actualizar chats inmediatamente
      window.dispatchEvent(new CustomEvent('refreshChats'));
      
      // Reset después de 15 segundos para dar tiempo a abrir el chat
      setTimeout(() => {
        setShowCheckout(false);
        setOrderSuccess(false);
        setCreatedOrderId(null);
        setCheckoutForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          customerAddress: "",
          notes: "",
        });
      }, 15000);
    } catch (error) {
      console.error("Error al crear orden:", error);
      alert(error.response?.data?.message || "Error al procesar la orden");
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = appearance?.colors?.primary || store?.primaryColor || "#2563eb";
  const accentColor = appearance?.colors?.secondary || store?.accentColor || "#0f172a";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-6xl mb-4">🛒</div>
        <p className="text-gray-600 text-lg">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header con búsqueda y filtros */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          {/* Búsqueda y carrito */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ focusRingColor: primaryColor }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  🔍
                </span>
              </div>
            </div>
            
            {/* Carrito */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 bg-white border-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: primaryColor }}
            >
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span 
                  className="absolute -top-2 -right-2 w-6 h-6 text-white rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Categorías */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={selectedCategory === "all" ? { backgroundColor: primaryColor } : {}}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={selectedCategory === cat ? { backgroundColor: primaryColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Ordenar y vista */}
          <div className="flex items-center justify-between gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Ordenar: A-Z</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="newest">Más Recientes</option>
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{filteredProducts.length} productos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-5xl mb-4">🔍</div>
            <p className="text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
                onQuickView={setSelectedProduct}
                primaryColor={primaryColor}
                storeId={store._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Carrito Lateral */}
      <CartSidebar
        cart={cart}
        show={showCart}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        total={cartTotal}
        primaryColor={primaryColor}
      />

      {/* Modal de Checkout */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={cartTotal}
          form={checkoutForm}
          setForm={setCheckoutForm}
          onSubmit={handleCheckout}
          onClose={() => setShowCheckout(false)}
          submitting={submitting}
          success={orderSuccess}
          primaryColor={primaryColor}
          orderId={createdOrderId}
          onOpenChat={() => setShowChatModal(true)}
        />
      )}

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          primaryColor={primaryColor}
        />
      )}

      {/* Modal de Chat */}
      {showChatModal && createdOrderId && (
        <CustomerChatModal
          type="order"
          id={createdOrderId}
          customerEmail={checkoutForm.customerEmail}
          customerName={checkoutForm.customerName}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart, onQuickView, primaryColor, storeId }) {
  const navigate = useNavigate();
  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
  const hasStock = product.stock > 0;

  const handleProductClick = () => {
    navigate(`/tienda/${storeId}/producto/${product._id}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-300 group flex flex-col h-full">
      {/* Imagen */}
      <div 
        className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer flex-shrink-0"
        onClick={handleProductClick}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
            📦
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{product.discount}%
            </span>
          )}
          {product.tags?.includes("nuevo") && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
              NUEVO
            </span>
          )}
        </div>

        {!hasStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="px-4 py-2 bg-white text-gray-900 font-bold rounded-lg">
              Agotado
            </span>
          </div>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium shadow-lg"
          >
            Vista Rápida
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {product.category}
          </span>
        )}
        
        <h3 
          onClick={handleProductClick}
          className="font-semibold text-gray-900 text-base mb-3 cursor-pointer hover:text-blue-600 transition-colors" 
          style={{ minHeight: '3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed mb-4" style={{ minHeight: '4rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description || 'Sin descripción disponible'}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4" style={{ minHeight: '2rem' }}>
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md h-fit">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer para empujar el precio y botón al fondo */}
        <div className="flex-1"></div>

        {/* Precio - Mejorado */}
        <div className="py-3 border-t border-b border-gray-100 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-gray-900">
                ${Math.round(finalPrice).toLocaleString('es-CL')}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  ${Math.round(product.price).toLocaleString('es-CL')}
                </span>
              )}
            </div>
            {product.stock !== undefined && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                Stock: {product.stock}
              </span>
            )}
          </div>
        </div>

        {/* Botón de agregar - Mejorado */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={!hasStock}
          className="w-full py-3.5 text-white rounded-lg font-semibold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: hasStock ? primaryColor : undefined }}
        >
          {hasStock ? "🛒 Agregar al Carrito" : "Sin Stock"}
        </button>
      </div>
    </div>
  );
}

function CartSidebar({ cart, show, onClose, onUpdateQuantity, onRemove, onCheckout, total, primaryColor }) {
  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Carrito ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 text-6xl mb-4">🛒</div>
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <CartItem
                key={item._id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${Math.round(total).toLocaleString('es-CL')}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-4 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const finalPrice = item.discount > 0 
    ? item.price * (1 - item.discount / 100) 
    : item.price;

  return (
    <div className="flex gap-4 pb-4 border-b border-gray-100">
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
            📦
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
        <p className="text-sm text-gray-500">${Math.round(finalPrice).toLocaleString('es-CL')} c/u</p>
        
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
              className="px-3 py-1 hover:bg-gray-100"
            >
              −
            </button>
            <span className="px-3 py-1 border-x border-gray-300">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
              className="px-3 py-1 hover:bg-gray-100"
              disabled={item.quantity >= item.stock}
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => onRemove(item._id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-gray-900">
          ${Math.round(finalPrice * item.quantity).toLocaleString('es-CL')}
        </p>
      </div>
    </div>
  );
}

function CheckoutModal({ cart, total, form, setForm, onSubmit, onClose, submitting, success, primaryColor, orderId, onOpenChat }) {
  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido Realizado!</h3>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu pedido. Te contactaremos pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Finalizar Compra</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumen del pedido */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">Resumen del Pedido</h3>
            {cart.map(item => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium text-gray-900">
                  ${Math.round((item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toLocaleString('es-CL')}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${Math.round(total).toLocaleString('es-CL')}</span>
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección de Entrega *
              </label>
              <textarea
                value={form.customerAddress}
                onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Instrucciones especiales, preferencias..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? "Procesando..." : "Confirmar Pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductQuickView({ product, onClose, onAddToCart, primaryColor }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
  const hasStock = product.stock > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Imágenes */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? "border-blue-500" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {product.category && (
                <span className="inline-block text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {product.category}
                </span>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ${Math.round(finalPrice).toLocaleString('es-CL')}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ${Math.round(product.price).toLocaleString('es-CL')}
                    </span>
                    <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Disponibilidad:</span>
                <span className={`font-medium ${hasStock ? "text-green-600" : "text-red-600"}`}>
                  {hasStock ? `${product.stock} en stock` : "Agotado"}
                </span>
              </div>

              {hasStock && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-6 py-2 border-x-2 border-gray-300 font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="w-full py-4 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    🛒 Agregar al Carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
