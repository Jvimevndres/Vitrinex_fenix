// frontend/src/pages/CustomerPublicPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { getPublicUser } from "../api/user";

const buildBg = (f = {}) => {
  if (f.bgMode === "solid") return { backgroundColor: f.bgColorTop || "#e1c0f6" };
  if (f.bgMode === "image" && f.bgImageUrl) {
    return {
      backgroundImage: `url(${f.bgImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: f.bgColorTop || "#e1c0f6",
    };
  }
  return {
    background: `linear-gradient(to bottom, ${
      f.bgColorTop || "#e1c0f6"
    } 0%, ${f.bgColorBottom || "#ffffff"} 100%)`,
  };
};

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white/90 border border-slate-100 rounded-xl p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-800">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function SmallDonut({ percent = 70, color = "#7c3aed" }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="inline-block">
      <circle cx="32" cy="32" r={r} stroke="#eef2ff" strokeWidth="8" fill="none" />
      <circle
        cx="32"
        cy="32"
        r={r}
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 32 32)"
        fill="none"
      />
    </svg>
  );
}

export default function CustomerPublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openContact, setOpenContact] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadUserSafe = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getPublicUser(id);
        // Normalizar posible respuesta de axios
        const data = res?.data ?? res;
        const u = data?.user ?? data;
        if (!mounted) return;
        if (!u) {
          setError("Respuesta de usuario vacía desde la API.");
          setUser(null);
        } else {
          setUser(u);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "No se pudo cargar el perfil del usuario.");
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUserSafe();
    return () => {
      mounted = false;
    };
  }, [id]);

  const pageStyle = useMemo(
    () => buildBg(user || {}),
    [user?.bgMode, user?.bgColorTop, user?.bgColorBottom, user?.bgImageUrl]
  );

  const avatarSrc = user?.avatarUrl || user?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const primaryColor = user?.primaryColor || "#7c3aed";
  const accentColor = user?.accentColor || "#0f172a";

  const sanitizePhone = (p) => (p ? p.replace(/\D/g, "") : "");
  const whatsappLink = (p) => {
    const num = sanitizePhone(p);
    return num ? `https://wa.me/${num}` : null;
  };
  const instagramLink = (handle) => (handle ? `https://instagram.com/${handle.replace(/^@/, "")}` : null);
  const facebookLink = (id) => (id ? `https://facebook.com/${id}` : null);
  const mailto = (email) => (email ? `mailto:${email}` : null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando perfil público..." />
        <p className="p-6 text-sm text-slate-500">Cargando información…</p>
      </div>
    );
  }

  const stats = {
    revenue: user?.stats?.revenue ?? "—",
    orders: user?.stats?.orders ?? 0,
    interactions: user?.stats?.interactions ?? 0,
    responseRate: user?.stats?.responseRate ?? 78,
  };

  // Normalización de posibles campos de la API
  const instaHandle = user?.social?.instagram ?? user?.instagram ?? user?.instagramHandle ?? null;
  const fbId = user?.social?.facebook ?? user?.facebook ?? null;
  const waPhone = user?.phone ?? user?.whatsapp ?? user?.contact?.phone ?? null;
  const emailAddr = user?.email ?? user?.contact?.email ?? null;

  const instaUrl = instaHandle ? instagramLink(instaHandle) : null;
  const fbUrl = fbId ? facebookLink(fbId) : null;
  const waUrl = waPhone ? whatsappLink(waPhone) : null;
  const mailUrl = emailAddr ? mailto(emailAddr) : null;

  return (
    <div className="min-h-screen flex flex-col" style={pageStyle}>
      <MainHeader subtitle="Perfil de usuario" />

      {error && (
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-md p-3 text-sm">
            {error}
          </div>
        </div>
      )}

      {(!user && !loading) && (
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white/80 border border-slate-100 rounded-lg p-6 text-center">
            <p className="text-sm text-slate-600">No se encontró información del usuario. Revisa la consola para más detalles.</p>
          </div>
        </main>
      )}

      {user && (
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-4 bg-white/90 border border-slate-100 rounded-2xl p-6 shadow">
              <div className="flex items-center gap-4">
                <img src={avatarSrc} alt={user.username || user.name || "Usuario"} className="w-28 h-28 rounded-full object-cover border border-slate-200" />
                <div>
                  <h1 className="text-xl font-semibold" style={{ color: accentColor }}>
                    {user.username || user.name || "Usuario sin nombre"}
                  </h1>
                  {user.title && <div className="text-sm text-slate-500">{user.title}</div>}
                  <div className="mt-2 text-xs text-slate-400">{user.location || user.city || ""}</div>
                  <div className="flex gap-2 mt-3">
                    <div className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">Online</div>
                    {user.tags?.slice(0, 3).map((t, i) => (
                      <div key={i} className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-full">{t}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button onClick={() => setOpenContact(true)} className="inline-flex items-center justify-center px-4 py-2 rounded-full text-white shadow-sm" style={{ background: primaryColor }}>
                  Contactar
                </button>
                <button type="button" onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:underline">Volver atrás</button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Calificación</div>
                  <div className="text-lg font-semibold text-slate-800 mt-1">{user.rating ?? "—"} ★</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Respuestas</div>
                  <div className="text-lg font-semibold text-slate-800 mt-1">{stats.responseRate}%</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700">Contacto</h3>
                <div className="mt-2 text-sm text-slate-600">
                  {emailAddr ? <div>Email: {emailAddr}</div> : <div className="text-sm text-slate-400">Email no disponible</div>}
                  {waPhone ? <div>Tel: {waPhone}</div> : null}
                  {user?.address && <div className="text-xs text-slate-400">{user.address}</div>}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <a aria-label="Instagram" title="Instagram" href={instaUrl || undefined} target="_blank" rel="noreferrer" className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white shadow ${instaUrl ? "bg-gradient-to-br from-pink-400 to-yellow-400" : "bg-slate-100 text-slate-400 pointer-events-none opacity-50"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                      <path d="M17.5 6.5h.01"></path>
                    </svg>
                  </a>

                  <a aria-label="Facebook" title="Facebook" href={fbUrl || undefined} target="_blank" rel="noreferrer" className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white shadow ${fbUrl ? "bg-blue-600" : "bg-slate-100 text-slate-400 pointer-events-none opacity-50"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.88v-6.99h-2.7V12h2.7V9.8c0-2.66 1.58-4.13 4-4.13 1.16 0 2.38.21 2.38.21v2.62h-1.34c-1.32 0-1.73.82-1.73 1.66V12h2.95l-.47 2.89h-2.48v6.99A10 10 0 0022 12z" /></svg>
                  </a>

                  <a aria-label="WhatsApp" title="WhatsApp" href={waUrl || undefined} target="_blank" rel="noreferrer" className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white shadow ${waUrl ? "bg-green-500" : "bg-slate-100 text-slate-400 pointer-events-none opacity-50"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-1.08 3.94L21 21l-5.68-1.49A8.5 8.5 0 1111.5 3.5 8.38 8.38 0 0121 11.5z"/><path d="M17 14.5c-.3 0-1.7-.6-2.3-.8-.6-.2-1-.2-1.4.2s-1 0-2-.6c-1.9-1.2-1.6-3.1-.9-3.8.5-.5.9-.6 1.3-.6.4 0 .8 0 1.2.1.4.1 1 .1 1.5-.1.5-.2 1-.6 1.4-1.1"/></svg>
                  </a>

                  <a aria-label="Correo" title="Enviar correo" href={mailUrl || undefined} className={`inline-flex items-center justify-center w-9 h-9 rounded-full shadow ${mailUrl ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-400 pointer-events-none opacity-50"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>
                  </a>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700">Habilidades</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(user.skills || ["Manicurista", "Softgel", "Rubber"]).map((s, i) => (
                    <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </aside>

            <section className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Ingresos" value={stats.revenue || "—"} subtitle="Último mes" />
                <StatCard title="Pedidos" value={stats.orders || 0} subtitle="Total" />
                <div className="bg-white/90 border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-500">Interacciones</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-800">{stats.interactions}</div>
                    <div className="text-xs text-slate-400 mt-1">Últimos 30 días</div>
                  </div>
                  <div className="flex items-center">
                    <SmallDonut percent={stats.responseRate} color="#7c3aed" />
                  </div>
                </div>
              </div>

              <div className="bg-white/90 border border-slate-100 rounded-2xl p-4 shadow">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Sobre este usuario</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">{user.bio || "Este usuario aún no ha agregado una biografía en su perfil."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/90 border border-slate-100 rounded-2xl p-4 shadow">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Galería</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(user.gallery || []).slice(0, 6).map((g, i) => (
                      <img key={i} src={g} alt={`Trabajo ${i + 1}`} className="w-full h-28 object-cover rounded-md" loading="lazy" />
                    ))}
                    {(!user.gallery || user.gallery.length === 0) && <div className="col-span-3 text-sm text-slate-400">Aún no hay fotos de trabajos.</div>}
                  </div>
                </div>

                <div className="bg-white/90 border border-slate-100 rounded-2xl p-4 shadow">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Reseñas</h4>
                  {(user.reviews || []).slice(0, 4).map((r, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{r.from || "Cliente"}</div>
                        <div className="text-xs text-slate-400">{r.date}</div>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">{r.text}</div>
                    </div>
                  ))}
                  {(!user.reviews || user.reviews.length === 0) && <div className="text-sm text-slate-400">Aún no hay reseñas.</div>}
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      {openContact && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Contactar a {user.username || user.name}</h3>
              <button onClick={() => setOpenContact(false)} className="text-slate-500">✕</button>
            </div>
            <form className="mt-4" onSubmit={(e) => { e.preventDefault(); alert("Mensaje enviado (demo)"); setOpenContact(false); }}>
              <label className="block text-sm text-slate-600">Tu nombre</label>
              <input required className="mt-1 mb-3 w-full rounded-md border px-3 py-2 text-sm" />
              <label className="block text-sm text-slate-600">Mensaje</label>
              <textarea required className="mt-1 mb-3 w-full rounded-md border px-3 py-2 text-sm" rows={4} />
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500">También puedes usar los iconos de contacto en el perfil.</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setOpenContact(false)} className="px-4 py-2 rounded-md text-sm border">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-md text-sm text-white" style={{ background: primaryColor }}>Enviar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
