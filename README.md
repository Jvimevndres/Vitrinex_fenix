# 🛍️ VITRINEX — Plataforma Digital para Emprendedores

Vitrinex es una aplicación web que conecta a emprendedores locales con clientes a través de una plataforma digital moderna.  
Permite registrar negocios, gestionar productos, ofrecer promociones y facilitar la interacción entre tiendas y usuarios.

---

## 🚀 Tecnologías Utilizadas

### 🧠 **Frontend (React + Vite)**
- React 18
- Vite 7
- React Router DOM 7
- Axios
- TailwindCSS
- Context API

### ⚙️ **Backend (Node + Express + MongoDB)**
- Node.js + Express
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- Cookie-parser
- BcryptJS
- CORS
- Dotenv
- Nodemon

---

## 📂 Estructura del Proyecto

VITRINEX/
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── middlewares/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── schemas/
│ │ ├── app.js
│ │ ├── config.js
│ │ ├── db.js
│ │ └── index.js
│ ├── package.json
│ └── .env
│
└── frontend/
├── public/
├── src/
│ ├── api/
│ ├── assets/
│ ├── components/
│ ├── context/
│ ├── pages/
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
├── package.json
├── vite.config.js
└── .env

---

## ⚙️ Configuración del Entorno

### 🔑 Backend (.env)
Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cd backend
cp .env.example .env
```

Configura las siguientes variables:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/vitrinex
JWT_SECRET=clave_super_segura_y_larga_cambiar_en_produccion
FRONTEND_ORIGIN=http://localhost:5173
API_PUBLIC_URL=http://localhost:3000
NODE_ENV=development
```

⚠️ **IMPORTANTE:** En producción, genera un JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 🌐 Frontend (.env)
Copia el archivo `.env.example`:

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000/api
```

▶️ Instrucciones de Ejecución
1️⃣ Clonar el repositorio
git clone https://github.com/<tu_usuario>/vitrinex.git
cd vitrinex
2️⃣ Instalar dependencias
cd backend
npm install

cd ../frontend
npm install
3️⃣ Ejecutar servidores

Backend:

cd backend
npm run dev
Servidor en → http://localhost:3000

Frontend:

cd frontend
npm run dev


App en → http://localhost:5173
🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) almacenado en cookies seguras (HTTPOnly).
Esto garantiza que el usuario pueda mantenerse autenticado entre sesiones sin exponer sus credenciales.

Registro → /api/auth/register

Login → /api/auth/login

Perfil → /api/auth/profile

Logout → /api/auth/logout
## 🧩 Funcionalidades Actuales

### 🔐 Autenticación y Seguridad
✅ Registro/login con JWT en cookies HTTPOnly  
✅ Rate limiting (6 intentos/15min) en rutas de auth  
✅ Hashing bcrypt (10 rounds)  
✅ Helmet para headers HTTP seguros  
✅ Validación de tipos de archivo en uploads (solo imágenes)  
✅ Límite de tamaño de archivos (5MB máximo)  
✅ CORS configurado correctamente  
✅ Validación Zod en schemas  

### 🏪 Sistema de Tiendas
✅ Dos modos: **productos** o **agendamiento**  
✅ Geolocalización con mapa Leaflet interactivo  
✅ Personalización visual completa  
✅ Upload de logos y productos  
✅ Filtros por comuna y tipo de negocio  
✅ Paginación optimizada  

### 🛒 E-commerce
✅ CRUD completo de productos  
✅ Sistema de pedidos  
✅ Control de inventario  
✅ Insights y analytics  

### 📅 Sistema de Agendamiento
✅ Configuración de horarios  
✅ Reservas con validación  
✅ Métricas de ocupación  

---

## 🔒 Seguridad Implementada

- ✅ **JWT Obligatorio en Producción:** Validación de JWT_SECRET
- ✅ **Validación de Archivos:** Solo imágenes permitidas (JPEG, PNG, WebP, GIF)
- ✅ **Límite de Tamaño:** Máximo 5MB por archivo
- ✅ **Rate Limiting:** Protección contra fuerza bruta
- ✅ **Helmet:** Headers HTTP seguros
- ✅ **Validación Zod:** Schemas para datos críticos
- ✅ **Índices MongoDB:** Queries optimizadas
- ✅ **Paginación:** Máximo 100 registros por página
- ✅ **Manejo de Errores Global:** Middleware centralizado

---

## 🚀 Despliegue en Producción

### Checklist antes de desplegar:

1. **Variables de entorno:**
   - ✅ JWT_SECRET único y seguro
   - ✅ MONGODB_URI apuntando a Atlas
   - ✅ NODE_ENV=production
   - ✅ FRONTEND_ORIGIN con dominio real

2. **Base de datos:**
   - ✅ MongoDB Atlas configurado
   - ✅ IP whitelist configurada
   - ✅ Usuario con permisos mínimos

3. **Backend:**
   ```bash
   npm run build  # Si tienes script de build
   npm start      # O usar PM2
   ```

4. **Frontend:**
   ```bash
   npm run build
   # Servir dist/ con Nginx, Vercel, Netlify, etc.
   ```

---

## 📊 Performance

- **Índices MongoDB:** Compuestos para geolocalización y filtros
- **Paginación:** Limita carga de datos
- **Validación:** Reduce procesamiento innecesario
- **CORS:** Configurado para dominios específicos

---

## 🧪 Testing

```bash
cd backend
npm test
```

Actualmente hay tests para:
- Insights de productos
- Insights de bookings

---👨‍💻 Autores

Maximiliano Inostroza
Jaime Herrera
Estudiantes de Ingeniería en Informática — INACAP Renca
Proyecto de Título 2025
📍 Renca, Santiago de Chile
📧 maxitrabajos49@gmail.com
💡 Desarrollado con pasión por impulsar el emprendimiento local.