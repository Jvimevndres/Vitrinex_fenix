// backend/src/controllers/auth.controller.js
import User from "../models/user.model.js";
import { createAccessToken } from "../libs/jwt.js";

const isProd = process.env.NODE_ENV === "production";

// 🧾 REGISTRO
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ message: "El correo ya está registrado" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = await createAccessToken({ id: newUser._id });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      path: "/",
    });

    return res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role || 'user',
      avatarUrl: newUser.avatarUrl || null,
      bio: newUser.bio || "",
      rut: newUser.rut || "",
      phone: newUser.phone || "",
      address: newUser.address || "",
      primaryColor: newUser.primaryColor,
      accentColor: newUser.accentColor,
      bgMode: newUser.bgMode,
      bgColorTop: newUser.bgColorTop,
      bgColorBottom: newUser.bgColorBottom,
      bgPattern: newUser.bgPattern,
      bgImageUrl: newUser.bgImageUrl,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ message: "El correo ya está registrado" });
    }
    return res
      .status(500)
      .json({ message: "Error interno al registrar" });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas" });
    }

    const isMatch = await userFound.comparePassword(password);
    
    if (!isMatch) {
      console.log('❌ Password incorrecta');
      return res
        .status(401)
        .json({ message: "Credenciales inválidas" });
    }

    console.log('🎫 Creando token...');
    const token = await createAccessToken({ id: userFound._id });
    console.log('✅ Token creado');
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      path: "/",
    });

    console.log('📦 Preparando respuesta...');
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role || 'user',
      avatarUrl: userFound.avatarUrl || null,
      bio: userFound.bio || "",
      rut: userFound.rut || "",
      phone: userFound.phone || "",
      address: userFound.address || "",
      primaryColor: userFound.primaryColor,
      accentColor: userFound.accentColor,
      bgMode: userFound.bgMode,
      bgColorTop: userFound.bgColorTop,
      bgColorBottom: userFound.bgColorBottom,
      bgPattern: userFound.bgPattern,
      bgImageUrl: userFound.bgImageUrl,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error interno al iniciar sesión" });
  }
};

// 🚪 LOGOUT
export const logout = (_req, res) => {
  res.clearCookie("token", { path: "/" });
  return res.json({ message: "Sesión cerrada" });
};

// 👤 PERFIL PRIVADO (usuario logueado)
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user)
    return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(user);
};

// ✏️ ACTUALIZAR PERFIL (privado)
export const updateProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      avatarUrl,
      bio,
      rut,
      phone,
      address,
      // User Persona fields
      title,
      quote,
      age,
      status,
      location,
      archetype,
      rating,
      personality,
      motivations,
      goals,
      frustrations,
      favoriteBrands,
      archetypes,
      // Visual customization
      primaryColor,
      accentColor,
      bgMode,
      bgColorTop,
      bgColorBottom,
      bgPattern,
      bgImageUrl,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (username) user.username = username;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists && exists._id.toString() !== user._id.toString()) {
        return res
          .status(409)
          .json({ message: "Ese correo ya está en uso" });
      }
      user.email = email;
    }

    if (password && password.length >= 6) {
      user.password = password; // el pre('save') la hashea
    }

    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;
    if (rut !== undefined) user.rut = rut;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    // User Persona fields
    if (title !== undefined) user.title = title;
    if (quote !== undefined) user.quote = quote;
    if (age !== undefined) user.age = age;
    if (status !== undefined) user.status = status;
    if (location !== undefined) user.location = location;
    if (archetype !== undefined) user.archetype = archetype;
    if (rating !== undefined) user.rating = rating;
    if (personality !== undefined) user.personality = personality;
    if (motivations !== undefined) user.motivations = motivations;
    if (goals !== undefined) user.goals = goals;
    if (frustrations !== undefined) user.frustrations = frustrations;
    if (favoriteBrands !== undefined) user.favoriteBrands = favoriteBrands;
    if (archetypes !== undefined) user.archetypes = archetypes;

    // Visual customization
    if (primaryColor !== undefined) user.primaryColor = primaryColor;
    if (accentColor !== undefined) user.accentColor = accentColor;
    if (bgMode !== undefined) user.bgMode = bgMode;
    if (bgColorTop !== undefined) user.bgColorTop = bgColorTop;
    if (bgColorBottom !== undefined) user.bgColorBottom = bgColorBottom;
    if (bgPattern !== undefined) user.bgPattern = bgPattern;
    if (bgImageUrl !== undefined) user.bgImageUrl = bgImageUrl;

    await user.save();

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || "",
      rut: user.rut || "",
      phone: user.phone || "",
      address: user.address || "",
      title: user.title,
      quote: user.quote,
      age: user.age,
      status: user.status,
      location: user.location,
      archetype: user.archetype,
      rating: user.rating,
      personality: user.personality,
      motivations: user.motivations,
      goals: user.goals,
      frustrations: user.frustrations,
      favoriteBrands: user.favoriteBrands,
      archetypes: user.archetypes,
      stats: user.stats,
      primaryColor: user.primaryColor,
      accentColor: user.accentColor,
      bgMode: user.bgMode,
      bgColorTop: user.bgColorTop,
      bgColorBottom: user.bgColorBottom,
      bgPattern: user.bgPattern,
      bgImageUrl: user.bgImageUrl,
    });
  } catch (err) {
    console.error("❌ Error al actualizar perfil:", err);
    return res
      .status(500)
      .json({ message: "Error al actualizar el perfil" });
  }
};

// 🌐 PERFIL PÚBLICO (por ID, sin autenticación)
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Calcular número de negocios del usuario
    const Store = (await import("../models/store.model.js")).default;
    const businessCount = await Store.countDocuments({
      $or: [{ owner: user._id }, { user: user._id }],
      isActive: true,
    });

    // Actualizar estadísticas si han cambiado
    if (!user.stats) {
      user.stats = { projects: 0, businesses: 0, responseRate: 0 };
    }
    
    if (user.stats.businesses !== businessCount) {
      user.stats.businesses = businessCount;
      await user.save();
    }

    return res.json(user);
  } catch (err) {
    console.error("❌ Error al obtener perfil público:", err);
    return res
      .status(500)
      .json({ message: "Error al obtener el perfil público" });
  }
};
