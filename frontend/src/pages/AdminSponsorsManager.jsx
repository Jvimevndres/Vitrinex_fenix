import { useState, useEffect } from 'react';
import { getAllSponsorAds, createSponsorAd, updateSponsorAd, deleteSponsorAd } from '../api/sponsors';

export default function AdminSponsorsManager() {
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState({
    name: '',
    imageUrl: '',
    link: '',
    position: 'top',
    priority: 0,
    active: true,
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const res = await getAllSponsorAds();
      setAds(res.data.sponsorAds);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await updateSponsorAd(editingAd._id, form);
      } else {
        await createSponsorAd(form);
      }
      loadAds();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Error guardando anuncio');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este anuncio?')) return;
    try {
      await deleteSponsorAd(id);
      loadAds();
    } catch (error) {
      alert('Error eliminando anuncio');
    }
  };

  const resetForm = () => {
    setForm({ name: '', imageUrl: '', link: '', position: 'top', priority: 0, active: true });
    setEditingAd(null);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setForm({ ...ad });
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, imageUrl: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 min-h-[calc(100vh-12rem)]">
      <div className="bg-white rounded-xl p-6 border border-slate-200 min-h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestión de Anuncios</h2>
            <p className="text-sm text-slate-600 mt-1">
              {ads.length} {ads.length === 1 ? 'anuncio' : 'anuncios'} registrado{ads.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Nuevo Anuncio
          </button>
        </div>

        {ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay anuncios</h3>
            <p className="text-slate-600 mb-6">Crea tu primer anuncio publicitario</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Crear Primer Anuncio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ads.map((ad) => (
            <div key={ad._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
              {ad.imageUrl ? (
                <img src={ad.imageUrl} alt={ad.name} className="w-full h-40 object-cover rounded-lg mb-3 border border-slate-100" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-4xl">📢</span>
                </div>
              )}
              <h3 className="font-semibold text-slate-900 truncate mb-1">{ad.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-500">
                  {ad.position === 'top' && '⬆️ Superior'}
                  {ad.position === 'sidebarLeft' && '⬅️ Lateral Izq'}
                  {ad.position === 'sidebarRight' && '➡️ Lateral Der'}
                  {ad.position === 'betweenSections' && '↕️ Entre Secciones'}
                  {ad.position === 'footer' && '⬇️ Footer'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {ad.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>👁️ {ad.impressions || 0}</span>
                  <span>🖱️ {ad.clicks || 0}</span>
                  <span className="font-semibold">
                    {ad.clicks && ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) + '%' : '0%'} CTR
                  </span>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingAd ? 'Editar' : 'Nuevo'} Anuncio</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link (opcional)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Posición</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="top">Superior</option>
                  <option value="sidebarLeft">Lateral Izquierdo</option>
                  <option value="sidebarRight">Lateral Derecho</option>
                  <option value="betweenSections">Entre Secciones</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prioridad</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  id="active"
                />
                <label htmlFor="active" className="text-sm">Activo</label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
