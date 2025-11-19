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
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Anuncios</h2>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Nuevo Anuncio
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div key={ad._id} className="border border-slate-200 rounded-lg p-4">
              {ad.imageUrl && (
                <img src={ad.imageUrl} alt={ad.name} className="w-full h-32 object-cover rounded mb-3" />
              )}
              <h3 className="font-semibold text-slate-900">{ad.name}</h3>
              <p className="text-xs text-slate-500 mb-2">Posición: {ad.position}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {ad.active ? 'Activo' : 'Inactivo'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {ad.impressions} impresiones • {ad.clicks} clicks
              </div>
            </div>
          ))}
        </div>
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
                  <option value="sidebar-left">Lateral Izquierdo</option>
                  <option value="sidebar-right">Lateral Derecho</option>
                  <option value="between-sections">Entre Secciones</option>
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
