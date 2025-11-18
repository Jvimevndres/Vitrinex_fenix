import axios from 'axios';

const storeId = '69180e38e10494815ac028f5';
const token = 'TU_TOKEN_AQUI'; // Necesitas obtenerlo del navegador

async function testSaveSpecialDay() {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/stores/${storeId}/special-days`,
      {
        date: '2025-11-18',
        isClosed: false,
        reason: '',
        timeBlocks: [
          {
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Guardado exitoso:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSaveSpecialDay();
