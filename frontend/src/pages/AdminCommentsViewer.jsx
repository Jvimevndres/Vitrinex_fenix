import { useState, useEffect } from 'react';
import { getAllComments, updateCommentStatus } from '../api/comments';

export default function AdminCommentsViewer() {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState({ status: '', type: '' });

  useEffect(() => {
    loadComments();
  }, [filter]);

  const loadComments = async () => {
    try {
      const res = await getAllComments(filter);
      setComments(res.data.comments);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateStatus = async (id, status, adminNotes = '') => {
    try {
      await updateCommentStatus(id, status, adminNotes);
      loadComments();
    } catch (error) {
      alert('Error actualizando comentario');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Comentarios y Feedback</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="reviewed">Revisados</option>
            <option value="resolved">Resueltos</option>
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todos los tipos</option>
            <option value="platform">Plataforma</option>
            <option value="store">Tienda</option>
            <option value="feature-request">Solicitud</option>
            <option value="bug-report">Bug</option>
          </select>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{comment.subject}</h3>
                  <p className="text-sm text-slate-600">
                    Por: {comment.user?.username || 'Usuario'} • {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    comment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    comment.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {comment.status}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                    {comment.type}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-700 mb-3">{comment.message}</p>
              {comment.rating && (
                <p className="text-sm text-amber-600 mb-2">
                  {'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}
                </p>
              )}
              <div className="flex gap-2">
                {comment.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(comment._id, 'reviewed')}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Marcar como revisado
                  </button>
                )}
                {comment.status !== 'resolved' && (
                  <button
                    onClick={() => updateStatus(comment._id, 'resolved')}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Resolver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
