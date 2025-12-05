import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox';
import { FaComments, FaExclamationTriangle } from 'react-icons/fa';

/**
 * BookingChatPage - Página pública para que clientes accedan al chat de su reserva
 * URL: /reserva/:bookingId/chat?email=cliente@email.com
 */
export default function BookingChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = window.location.pathname.split('/')[2];
  const emailFromURL = searchParams.get('email');

  const [email, setEmail] = useState(emailFromURL || '');
  const [verified, setVerified] = useState(!!emailFromURL);
  const [error, setError] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }

    setError('');
    setVerified(true);
  };

  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-200">
          <div className="text-center mb-6">
            <FaComments className="text-6xl mb-4 text-blue-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Chat de tu Reserva
            </h1>
            <p className="text-sm text-slate-600">
              Verifica tu identidad para acceder
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm transition-all"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Ingresa el email que usaste al reservar
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              Acceder al Chat
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <ChatBox
          bookingId={bookingId}
          userType="customer"
          userEmail={email}
          onClose={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
