// Verificar reservas en la base de datos
import mongoose from 'mongoose';
import Booking from './src/models/booking.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function checkBookings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const total = await Booking.countDocuments();
    console.log(`📊 Total de reservas: ${total}\n`);

    const bookings = await Booking.find({})
      .select('customerEmail customerName date slot')
      .limit(20);

    console.log('📋 LISTADO DE RESERVAS:');
    bookings.forEach((b, idx) => {
      console.log(`[${idx + 1}] ${b.customerName} (${b.customerEmail}) - ${b.date} ${b.slot}`);
    });

    console.log('\n🔍 Probando búsqueda por email: patricio@gmail.com');
    const patricioBookings = await Booking.find({ customerEmail: 'patricio@gmail.com' });
    console.log(`   Encontradas: ${patricioBookings.length}`);
    patricioBookings.forEach(b => {
      console.log(`   - ${b.customerName} | ${b.customerEmail} | ${b.date}`);
    });

    console.log('\n🔍 Probando búsqueda por email: brian@gmail.com');
    const brianBookings = await Booking.find({ customerEmail: 'brian@gmail.com' });
    console.log(`   Encontradas: ${brianBookings.length}`);
    brianBookings.forEach(b => {
      console.log(`   - ${b.customerName} | ${b.customerEmail} | ${b.date}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBookings();
