// src/components/ModernProductManager.jsx
import { useState, useEffect } from "react";
import { 
  listStoreProductsForOwner, 
  createStoreProduct, 
  updateStoreProduct, 
  deleteStoreProduct,
} from "../api/store";
import axios from "axios";

export default function ModernProductManager({ storeId }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    tags: "",
    discount: "",
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    loadProducts();
  }, [storeId]);

  useEffect(() => {
    // Extraer categorías únicas de los productos
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    setCategories(uniqueCategories.sort());
  }, [products]);

  const loadProducts = async () => {
    console.log("🔄 ModernProductManager - Cargando productos para store:", storeId);
    try {
      setLoading(true);
      const { data } = await listStoreProductsForOwner(storeId);
      console.log("✅ Productos cargados:", data?.length || 0, data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
      console.error("📋 Detalles del error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error al cargar productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        category: product.category || "",
        tags: product.tags?.join(", ") || "",
        discount: product.discount || "",
        isActive: product.isActive !== false,
      });
      setProductImages(product.images || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        tags: "",
        discount: "",
        isActive: true,
      });
      setProductImages([]);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    console.log("🛒 ModernProductManager - Intentando guardar producto");
    console.log("📝 Form data:", formData);
    console.log("🏪 Store ID:", storeId);
    console.log("✏️ Editing product:", editingProduct?._id || "nuevo");

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        discount: parseFloat(formData.discount) || 0,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        images: productImages,
      };

      console.log("📦 Payload a enviar:", productData);

      if (editingProduct) {
        console.log("✏️ Actualizando producto existente:", editingProduct._id);
        await updateStoreProduct(storeId, editingProduct._id, productData);
      } else {
        console.log("➕ Creando nuevo producto");
        const response = await createStoreProduct(storeId, productData);
        console.log("✅ Respuesta del servidor:", response);
      }

      console.log("✅ Producto guardado exitosamente");
      await loadProducts();
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error guardando producto:", error);
      console.error("📋 Detalles del error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await deleteStoreProduct(storeId, productId);
      await loadProducts();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al eliminar producto");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      console.log("📤 Convirtiendo imagen a Base64...");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("✅ Imagen convertida a Base64");
        setProductImages([...productImages, reader.result]);
        setUploadingImage(false);
      };
      reader.onerror = () => {
        console.error("❌ Error al leer imagen");
        alert("No se pudo leer la imagen");
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Error al procesar imagen:", err);
      alert("No se pudo procesar la imagen");
      setUploadingImage(false);
    } finally {
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
          <p className="text-sm text-gray-600 mt-1">{products.length} productos en total</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-full sm:min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <span className="text-xl">☷</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {selectedCategory !== "all" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrando:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory("all")}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-5xl mb-4">📦</div>
          <p className="text-gray-600">No hay productos que mostrar</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Crear primer producto
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={() => handleOpenModal(product)}
              onDelete={() => handleDelete(product._id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <ProductListItem
              key={product._id}
              product={product}
              onEdit={() => handleOpenModal(product)}
              onDelete={() => handleDelete(product._id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductModal
          formData={formData}
          setFormData={setFormData}
          productImages={productImages}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          uploadingImage={uploadingImage}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isEditing={!!editingProduct}
          categories={categories}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
            📦
          </div>
        )}
        {!product.isActive && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
            Inactivo
          </div>
        )}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded font-bold">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
          {product.category && (
            <span className="text-xs text-gray-500">{product.category}</span>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${finalPrice.toLocaleString()}
          </span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductListItem({ product, onEdit, onDelete }) {
  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Image */}
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
              📦
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {product.category && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {product.category}
                  </span>
                )}
                {!product.isActive && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                    Inactivo
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded font-bold">
                    -{product.discount}%
                  </span>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{product.description}</p>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">
                  ${finalPrice.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.price.toLocaleString()}
                  </span>
                )}
              </div>
              <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ 
  formData, 
  setFormData, 
  productImages, 
  onImageUpload, 
  onRemoveImage, 
  uploadingImage, 
  onSave, 
  onClose, 
  isEditing,
  categories 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes del producto
            </label>
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((url, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                  <img src={url} alt={`Producto ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              {productImages.length < 4 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <div className="text-gray-400 text-sm">Subiendo...</div>
                  ) : (
                    <>
                      <span className="text-3xl text-gray-400 mb-1">+</span>
                      <span className="text-xs text-gray-500">Agregar</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Laptop HP 15.6 pulgadas"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe las características del producto..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              list="categories"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Electrónica, Ropa, Hogar..."
            />
            <datalist id="categories">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descuento (%)
            </label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: nuevo, oferta, destacado"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Producto activo (visible en la tienda)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isEditing ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </div>
    </div>
  );
}
