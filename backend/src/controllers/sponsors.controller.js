import SponsorAd from '../models/sponsorAd.model.js';

// Crear nuevo anuncio de auspiciador
export const createSponsorAd = async (req, res) => {
  try {
    const { name, imageUrl, link, position, priority, active } = req.body;

    const sponsorAd = new SponsorAd({
      name,
      imageUrl,
      link,
      position,
      priority: priority || 0,
      active: active !== undefined ? active : true,
    });

    await sponsorAd.save();

    res.status(201).json({ message: 'Anuncio creado', sponsorAd });
  } catch (error) {
    console.error('Error creando anuncio:', error);
    res.status(500).json({ message: 'Error creando anuncio', error: error.message });
  }
};

// Listar todos los anuncios
export const getAllSponsorAds = async (req, res) => {
  try {
    const { position, active } = req.query;

    const filter = {};
    if (position) filter.position = position;
    if (active !== undefined) filter.active = active === 'true';

    const sponsorAds = await SponsorAd.find(filter).sort({ priority: -1, createdAt: -1 });

    res.json({ sponsorAds });
  } catch (error) {
    console.error('Error listando anuncios:', error);
    res.status(500).json({ message: 'Error listando anuncios', error: error.message });
  }
};

// Obtener anuncios activos por posición (público, para tiendas free)
export const getActiveAdsByPosition = async (req, res) => {
  try {
    const { position } = req.params;

    // Obtener TODOS los anuncios activos de esta posición, sin límite
    const ads = await SponsorAd.find({ position, active: true })
      .sort({ priority: -1, createdAt: -1 }); // Ordenar por prioridad y luego por fecha de creación

    // Incrementar impressions
    if (ads.length > 0) {
      await SponsorAd.updateMany(
        { _id: { $in: ads.map(ad => ad._id) } },
        { $inc: { impressions: 1 } }
      );
    }

    res.json({ ads });
  } catch (error) {
    console.error('❌ Error obteniendo anuncios:', error);
    res.status(500).json({ message: 'Error obteniendo anuncios', error: error.message });
  }
};

// Actualizar anuncio
export const updateSponsorAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, link, position, priority, active } = req.body;

    const sponsorAd = await SponsorAd.findByIdAndUpdate(
      id,
      { name, imageUrl, link, position, priority, active },
      { new: true, runValidators: true }
    );

    if (!sponsorAd) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    res.json({ message: 'Anuncio actualizado', sponsorAd });
  } catch (error) {
    console.error('Error actualizando anuncio:', error);
    res.status(500).json({ message: 'Error actualizando anuncio', error: error.message });
  }
};

// Eliminar anuncio
export const deleteSponsorAd = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsorAd = await SponsorAd.findByIdAndDelete(id);

    if (!sponsorAd) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    res.json({ message: 'Anuncio eliminado' });
  } catch (error) {
    console.error('Error eliminando anuncio:', error);
    res.status(500).json({ message: 'Error eliminando anuncio', error: error.message });
  }
};

// Registrar click en anuncio
export const trackAdClick = async (req, res) => {
  try {
    const { id } = req.params;

    await SponsorAd.findByIdAndUpdate(id, { $inc: { clicks: 1 } });

    res.json({ message: 'Click registrado' });
  } catch (error) {
    console.error('Error registrando click:', error);
    res.status(500).json({ message: 'Error registrando click', error: error.message });
  }
};
