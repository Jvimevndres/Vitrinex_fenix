import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { FaComments } from 'react-icons/fa';

export default function ProductReviews({ productId, storeId }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    subject: '',
    message: ''
  });
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadComments();
  }, [productId, storeId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      // Obtenemos comentarios de la tienda usando el endpoint público
      const { data } = await axios.get(`/comments/store/${storeId}`);
      
      // Filtramos comentarios que mencionen el producto
      const productComments = data.filter(comment => 
        comment.subject?.toLowerCase().includes('producto') &&
        (comment.message?.includes(productId) || comment.subject?.includes(productId))
      );
      
      setComments(productComments);
      
      // Calcular promedio de rating
      if (productComments.length > 0) {
        const avg = productComments.reduce((sum, c) => sum + (c.rating || 0), 0) / productComments.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setSubmitting(true);
      
      await axios.post('/comments', {
        store: storeId,
        type: 'store',
        subject: `Producto: ${formData.subject}`,
        message: `[Producto ID: ${productId}] ${formData.message}`,
        rating: formData.rating
      }, {
        withCredentials: true
      });

      // Resetear formulario
      setFormData({
        rating: 5,
        subject: '',
        message: ''
      });

      // Recargar comentarios
      await loadComments();
      
      alert('¡Comentario publicado exitosamente!');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      alert(error.response?.data?.message || 'Error al publicar el comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onSelect = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onSelect(star) : undefined}
            disabled={!interactive}
            className={`text-2xl transition-all ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header con promedio */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Opiniones del Producto
            </h2>
            <p className="text-gray-600">
              ¿Ya lo compraste? ¡Cuéntanos tu experiencia!
            </p>
          </div>
          
          {comments.length > 0 && (
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <span className="text-5xl font-bold text-gray-900">{averageRating}</span>
                <div className="flex flex-col items-start">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm text-gray-500 mt-1">
                    {comments.length} {comments.length === 1 ? 'opinión' : 'opiniones'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de nuevo comentario */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>✍️</span>
          <span>Escribe tu opinión</span>
        </h3>

        {!isAuthenticated ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para dejar tu opinión
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Calificación
              </label>
              {renderStars(formData.rating, true, (rating) => 
                setFormData({ ...formData, rating })
              )}
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título de tu opinión
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ej: Excelente calidad"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tu opinión
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Cuéntanos qué te pareció el producto..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                required
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {submitting ? 'Publicando...' : '📤 Publicar Opinión'}
            </button>
          </form>
        )}
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaComments />
          <span>Todas las opiniones ({comments.length})</span>
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando opiniones...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-gray-600 font-medium text-lg">
              Aún no hay opiniones
            </p>
            <p className="text-gray-500 mt-2">
              ¡Sé el primero en compartir tu experiencia!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                {/* Header del comentario */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {comment.user?.avatarUrl ? (
                      <img
                        src={comment.user.avatarUrl}
                        alt={comment.user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                        {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {comment.user?.username || 'Usuario'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  {comment.rating && renderStars(comment.rating)}
                </div>

                {/* Título */}
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  {comment.subject?.replace('Producto: ', '')}
                </h4>

                {/* Mensaje */}
                <p className="text-gray-700 leading-relaxed">
                  {comment.message?.replace(/\[Producto ID:.*?\]\s*/, '')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
