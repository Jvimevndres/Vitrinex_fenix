import Comment from '../models/comment.model.js';

// Crear nuevo comentario/feedback
export const createComment = async (req, res) => {
  try {
    const { type, subject, message, rating, store, targetUser } = req.body;

    const comment = new Comment({
      user: req.userId,
      store,
      targetUser,
      type,
      subject,
      message,
      rating,
    });

    await comment.save();
    await comment.populate('user', 'username email avatarUrl');

    res.status(201).json({ message: 'Comentario enviado', comment });
  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({ message: 'Error creando comentario', error: error.message });
  }
};

// Listar comentarios (admin)
export const getAllComments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const comments = await Comment.find(filter)
      .populate('user', 'username email avatarUrl')
      .populate('store', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(filter);

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Error listando comentarios:', error);
    res.status(500).json({ message: 'Error listando comentarios', error: error.message });
  }
};

// Obtener comentarios del usuario actual
export const getMyComments = async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.userId })
      .populate('store', 'name')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({ message: 'Error obteniendo comentarios', error: error.message });
  }
};

// Actualizar estado de comentario (admin)
export const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true }
    ).populate('user', 'username email');

    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    res.json({ message: 'Comentario actualizado', comment });
  } catch (error) {
    console.error('Error actualizando comentario:', error);
    res.status(500).json({ message: 'Error actualizando comentario', error: error.message });
  }
};

// Eliminar comentario
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    // Verificar que el usuario es el dueño o es admin
    const user = await import('../models/user.model.js').then(m => m.default.findById(req.userId));
    if (comment.user.toString() !== req.userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await comment.deleteOne();

    res.json({ message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({ message: 'Error eliminando comentario', error: error.message });
  }
};

// Obtener comentarios públicos de una tienda
export const getStoreComments = async (req, res) => {
  try {
    const { storeId } = req.params;

    const comments = await Comment.find({ 
      store: storeId,
      type: 'store'
    })
      .populate('user', 'username avatarUrl')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error obteniendo comentarios de tienda:', error);
    res.status(500).json({ message: 'Error obteniendo comentarios', error: error.message });
  }
};

// Obtener comentarios públicos relacionados a un usuario (reseñas que ha recibido)
export const getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;

    const comments = await Comment.find({ 
      targetUser: userId,
      type: 'user',
      rating: { $exists: true, $ne: null }
    })
      .populate('user', 'username avatarUrl')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error obteniendo comentarios de usuario:', error);
    res.status(500).json({ message: 'Error obteniendo comentarios', error: error.message });
  }
};

