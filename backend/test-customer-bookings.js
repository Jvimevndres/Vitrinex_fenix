import axios from 'axios';

async function testCustomerBookings() {
  try {
    console.log('🧪 Probando endpoint /stores/bookings/my-bookings');
    console.log('📧 Email de prueba: patricio@gmail.com\n');

    const response = await axios.get('http://localhost:3000/api/stores/bookings/my-bookings', {
      params: { email: 'patricio@gmail.com' }
    });

    console.log('✅ Respuesta exitosa!');
    console.log('📊 Total de reservas:', response.data.length);
    console.log('\n📋 Detalles de las reservas:');
    
    response.data.forEach((booking, idx) => {
      console.log(`\n[${idx + 1}] Reserva ID: ${booking._id}`);
      console.log(`    Cliente: ${booking.customerName} (${booking.customerEmail})`);
      console.log(`    Fecha: ${booking.date}`);
      console.log(`    Hora: ${booking.slot}`);
      console.log(`    Tienda: ${booking.store?.name || 'N/A'}`);
      console.log(`    Servicio: ${booking.service?.name || 'N/A'}`);
      console.log(`    Mensajes sin leer: ${booking.unreadMessagesCustomer || 0}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testCustomerBookings();
