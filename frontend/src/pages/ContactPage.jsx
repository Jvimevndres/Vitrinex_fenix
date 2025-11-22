import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaEnvelope, FaGraduationCap, FaUser, FaCode } from "react-icons/fa";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [paletteMode, setPaletteMode] = useState(() => {
    try {
      if (typeof window === "undefined") return "warm";
      const v = localStorage.getItem("explore:paletteMode");
      return v === "warm" || v === "cool" ? v : "warm";
    } catch (e) {
      return "warm";
    }
  });

  // Colores morados característicos de Vitrinex
  const colors = {
    gradient: "from-purple-600 via-violet-600 to-indigo-600",
    card: "from-purple-50 to-violet-50",
    accent: "purple-600",
    button: "from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
    icon: "text-purple-600",
    bgGradient: "from-slate-900 via-purple-900 to-indigo-900",
  };

  const theme = colors;

  const team = [
    {
      name: "Jaime Herrera",
      role: "Desarrollador Full Stack",
      email: "jaime.herrera@inacapmail.cl",
      portfolio: "https://jvimevndres.github.io/cv/",
      github: "https://github.com/Jvimevndres",
      description: "Estudiante de Ingeniería en Informática, apasionado por el desarrollo web y la creación de soluciones innovadoras.",
      avatar: "JH"
    },
    {
      name: "Maximiliano Inostroza",
      role: "Desarrollador Full Stack",
      email: "maximiliano.inostroza04@inacapmail.cl",
      portfolio: "#", // Agregar su link cuando lo tenga
      github: "#",
      description: "Estudiante de Ingeniería en Informática, enfocado en crear experiencias de usuario excepcionales.",
      avatar: "MI"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <MainHeader variant="vitrinex" />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${theme.gradient} rounded-2xl shadow-2xl mb-6 animate-pulse`}>
              <FaGraduationCap className="text-4xl text-white" />
            </div>
            <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
              Contáctanos
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Proyecto de Tesis - INACAP Sede Renca
            </p>
            <p className="text-lg text-slate-500 mt-2">
              Conoce al equipo detrás de Vitrinex
            </p>
          </div>

          {/* Team Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${theme.gradient} p-8 text-white`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{member.name}</h3>
                      <p className="text-white/90 font-medium">{member.role}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {member.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <a 
                      href={`mailto:${member.email}`}
                      className={`flex items-center space-x-3 ${theme.icon} hover:underline transition-colors group`}
                    >
                      <FaEnvelope className="text-xl group-hover:scale-110 transition-transform" />
                      <span className="text-slate-700">{member.email}</span>
                    </a>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-3">
                    {member.portfolio !== "#" && (
                      <a
                        href={member.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 bg-gradient-to-r ${theme.button} text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2`}
                      >
                        <FaUser />
                        <span>Portfolio</span>
                      </a>
                    )}
                    {member.github !== "#" && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <FaGithub />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
            <div className="text-center max-w-3xl mx-auto">
              <FaCode className={`text-5xl ${theme.icon} mx-auto mb-6`} />
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Sobre el Proyecto
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                <strong>Vitrinex</strong> es una plataforma innovadora desarrollada como proyecto de tesis 
                en INACAP Sede Renca. Nuestro objetivo es conectar negocios locales con clientes 
                de manera inteligente, facilitando la gestión de citas, productos y servicios.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme.icon} mb-2`}>2024-2025</div>
                  <div className="text-slate-600">Período de Desarrollo</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme.icon} mb-2`}>MERN Stack</div>
                  <div className="text-slate-600">Tecnologías</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme.icon} mb-2`}>Ingeniería</div>
                  <div className="text-slate-600">Informática</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl shadow-2xl p-8 md:p-12 text-white text-center`}>
            <h2 className="text-3xl font-bold mb-4">
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Estamos abiertos a colaboraciones y nuevos desafíos. 
              No dudes en contactarnos para discutir tus ideas.
            </p>
            <Link
              to="/"
              className="inline-block bg-white text-slate-800 font-bold py-4 px-8 rounded-lg hover:bg-slate-100 transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Explorar Vitrinex →
            </Link>
          </div>

        </div>
      </main>

      <Footer paletteMode={paletteMode} />
    </div>
  );
}
