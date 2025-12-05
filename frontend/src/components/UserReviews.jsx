import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { FaComments } from 'react-icons/fa';

export default function UserReviews({ userId, username }) {
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
  }, [userId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      // Obtenemos comentarios del usuario usando el endpoint público
      const { data } = await axios.get(`/comments/user/${userId}`);
      
      setComments(data);
      
      // Calcular promedio de rating
      if (data.length > 0) {
        const avg = data.reduce((sum, c) => sum + (c.rating || 0), 0) / data.length;
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
        type: 'user',
        targetUser: userId,
        subject: formData.subject,
        message: formData.message,
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
    <div className="space-y-6 animate-slideIn">
      {/* Header con promedio */}
      <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <FaComments /> Reseñas y Opiniones
            </h2>
            <p className="text-slate-300">
              ¿Conoces a {username}? ¡Comparte tu experiencia!
            </p>
          </div>
          
          {comments.length > 0 && (
            <div className="text-center">
              <div className="flex items-center gap-3 justify-center mb-2">
                <span className="text-5xl font-bold text-white">{averageRating}</span>
                <div className="flex flex-col items-start">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm text-slate-300 mt-1">
                    {comments.length} {comments.length === 1 ? 'reseña' : 'reseñas'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de nuevo comentario */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>✍️</span>
          <span>Escribe una reseña</span>
        </h3>

        {!isAuthenticated ? (
          <div className="text-center py-8 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="text-slate-300 mb-4">
              Debes iniciar sesión para dejar una reseña
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Iniciar Sesión
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Calificación
              </label>
              {renderStars(formData.rating, true, (rating) => 
                setFormData({ ...formData, rating })
              )}
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Título de tu reseña
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ej: Excelente persona"
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
              />
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Tu reseña
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Cuéntanos tu experiencia con este usuario..."
                rows={5}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                required
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {submitting ? 'Publicando...' : '📤 Publicar Reseña'}
            </button>
          </form>
        )}
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>💭</span>
          <span>Todas las reseñas ({comments.length})</span>
        </h3>

        {loading ? (
          <div className="text-center py-12 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl">
            <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-300">Cargando reseñas...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-white font-medium text-lg">
              Aún no hay reseñas
            </p>
            <p className="text-slate-300 mt-2">
              ¡Sé el primero en compartir tu experiencia!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all"
              >
                {/* Header del comentario */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {comment.user?.avatarUrl ? (
                      <img
                        src={comment.user.avatarUrl}
                        alt={comment.user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/50"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                        {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        {comment.user?.username || 'Usuario'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  {comment.rating && renderStars(comment.rating)}
                </div>

                {/* Título */}
                <h4 className="font-bold text-white text-lg mb-2">
                  {comment.subject?.replace(`Usuario ${username}: `, '')}
                </h4>

                {/* Mensaje */}
                <p className="text-slate-300 leading-relaxed">
                  {comment.message?.replace(/\[Usuario ID:.*?\]\s*/, '')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
