import { Link } from "react-router-dom";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn,
  FaYoutube,
  FaGraduationCap 
} from "react-icons/fa";
import { MdPhone, MdLocationOn } from "react-icons/md";

/**
 * Footer profesional - Proyecto de Tesis INACAP Renca
 * Adaptado con colores dinámicos warm/cool del sistema Vitrinex
 */
export default function Footer({ paletteMode = "warm" }) {
  const currentYear = new Date().getFullYear();
  
  // Colores dinámicos según el modo warm/cool
  const colors = {
    warm: {
      primary: "from-orange-400 to-pink-500",
      accent: "orange-400",
      hover: "hover:bg-orange-600",
      icon: "text-orange-400",
      button: "from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700",
    },
    cool: {
      primary: "from-sky-400 to-blue-500",
      accent: "sky-400",
      hover: "hover:bg-blue-600",
      icon: "text-sky-400",
      button: "from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
    }
  };
  
  const theme = colors[paletteMode] || colors.warm;

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-auto">
      {/* Sección principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Columna 1: Sobre Vitrinex */}
          <div>
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${theme.primary} rounded-lg flex items-center justify-center shadow-lg`}>
                <span className="text-xl font-bold">V</span>
              </div>
              <h3 className={`ml-3 text-lg font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                VITRINEX
              </h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              Plataforma innovadora para la gestión y visualización de negocios locales. 
              Conectando comercios con clientes de forma inteligente.
            </p>
            <div className="space-y-1.5">
              <p className="text-xs text-slate-400 flex items-start">
                <FaGraduationCap className={`mt-0.5 mr-2 flex-shrink-0 ${theme.icon}`} />
                <span className="font-medium text-slate-300">Proyecto de Tesis</span>
              </p>
              <p className="text-xs text-slate-400 flex items-start">
                <MdLocationOn className={`mt-0.5 mr-2 flex-shrink-0 ${theme.icon}`} />
                <span>INACAP - Sede Renca<br/>Santiago, Chile</span>
              </p>
            </div>
          </div>

          {/* Columna 2: Síguenos */}
          <div>
            <h4 className="text-base font-semibold mb-3 text-white">Síguenos</h4>
            <div className="flex space-x-2.5 mb-4">
              <a
                href="https://www.facebook.com/inacap"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 bg-slate-700 ${theme.hover} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                aria-label="Facebook"
              >
                <FaFacebookF className="text-base" />
              </a>
              <a
                href="https://twitter.com/inacap"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 bg-slate-700 ${theme.hover} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                aria-label="Twitter"
              >
                <FaTwitter className="text-base" />
              </a>
              <a
                href="https://www.instagram.com/inacap_oficial"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 bg-slate-700 ${theme.hover} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                aria-label="Instagram"
              >
                <FaInstagram className="text-base" />
              </a>
              <a
                href="https://www.linkedin.com/school/inacap"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 bg-slate-700 ${theme.hover} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="text-base" />
              </a>
              <a
                href="https://www.youtube.com/user/inacap"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 bg-slate-700 ${theme.hover} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                aria-label="YouTube"
              >
                <FaYoutube className="text-base" />
              </a>
            </div>
            <div className="mt-4">
              <h5 className="text-sm font-semibold mb-2 text-white">Apóyanos</h5>
              <Link
                to="/contacto"
                className={`inline-block bg-gradient-to-r ${theme.button} text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 text-sm`}
              >
                Contáctanos
              </Link>
            </div>
          </div>

          {/* Columna 3: Recursos y Links */}
          <div>
            <h4 className="text-base font-semibold mb-3 text-white">Recursos & Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://www.inacap.cl" target="_blank" rel="noopener noreferrer" className={`text-slate-300 hover:${theme.icon} transition-colors text-sm flex items-center`}>
                  <span className="mr-2">→</span> INACAP
                </a>
              </li>
              <li>
                <a href="https://biblioteca.inacap.cl" target="_blank" rel="noopener noreferrer" className={`text-slate-300 hover:${theme.icon} transition-colors text-sm flex items-center`}>
                  <span className="mr-2">→</span> Biblioteca
                </a>
              </li>
              <li>
                <Link to="/" className={`text-slate-300 hover:${theme.icon} transition-colors text-sm flex items-center`}>
                  <span className="mr-2">→</span> Registrar mi Negocio
                </Link>
              </li>
              <li>
                <a href="https://www.inacap.cl/mi-inacap" target="_blank" rel="noopener noreferrer" className={`text-slate-300 hover:${theme.icon} transition-colors text-sm flex items-center`}>
                  <span className="mr-2">→</span> Mi INACAP
                </a>
              </li>
              <li>
                <Link to="/explorar" className={`text-slate-300 hover:${theme.icon} transition-colors text-sm flex items-center`}>
                  <span className="mr-2">→</span> Ver Mapa
                </Link>
              </li>
              <li>
                <a href="https://portalalumno.inacap.cl" target="_blank" rel="noopener noreferrer" className={`text-slate-300 hover:${theme.icon} transition-colors text-sm flex items-center`}>
                  <span className="mr-2">→</span> Portal Alumno
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Visítanos */}
          <div>
            <h4 className="text-base font-semibold mb-3 text-white">Visítanos</h4>
            <div className="space-y-3">
              <div>
                <h5 className={`text-sm font-semibold ${theme.icon} mb-1.5`}>Mapa & Direcciones</h5>
                <p className="text-slate-300 text-sm leading-relaxed">
                  INACAP Sede Renca<br/>
                  Región Metropolitana<br/>
                  Santiago, Chile
                </p>
                <a 
                  href="https://www.google.com/maps/search/INACAP+Renca" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-block mt-1.5 ${theme.icon} hover:text-white text-sm font-medium transition-colors`}
                >
                  Ver en Mapa →
                </a>
              </div>
              
              <div>
                <h5 className={`text-sm font-semibold ${theme.icon} mb-1.5`}>Proyecto de Tesis</h5>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Desarrollado por estudiantes de Ingeniería como proyecto final de titulación.
                </p>
              </div>

              <div>
                <h5 className={`text-sm font-semibold ${theme.icon} mb-1.5`}>Información de Contacto</h5>
                <p className="text-slate-300 text-sm">
                  <MdPhone className={`inline mr-1 ${theme.icon}`} />
                  <a href="tel:600467226" className="hover:text-white transition-colors">
                    600 467 2266
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-slate-400 text-sm text-center md:text-left">
              <p>© {currentYear} VITRINEX - Proyecto de Tesis. Todos los derechos reservados.</p>
              <p className="mt-0.5">
                Desarrollado por estudiantes de <span className={`${theme.icon} font-medium`}>INACAP Sede Renca</span>
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link to="/contacto" className={`text-slate-400 hover:${theme.icon} transition-colors`}>
                Sobre Nosotros
              </Link>
              <span className="text-slate-600">|</span>
              <a 
                href="https://github.com/Jvimevndres/Vitrinex_fenix" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`text-slate-400 hover:${theme.icon} transition-colors`}
              >
                GitHub
              </a>
              <span className="text-slate-600">|</span>
              <a 
                href="https://jvimevndres.github.io/cv/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`text-slate-400 hover:${theme.icon} transition-colors`}
              >
                Portfolio
              </a>
              <span className="text-slate-600">|</span>
              <Link to="/contacto" className={`text-slate-400 hover:${theme.icon} transition-colors`}>
                Contacto
              </Link>
              <span className="text-slate-600">|</span>
              <a href="https://www.inacap.cl" target="_blank" rel="noopener noreferrer" className={`text-slate-400 hover:${theme.icon} transition-colors`}>
                INACAP
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
