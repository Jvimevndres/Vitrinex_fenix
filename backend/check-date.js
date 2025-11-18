// Verificar qué día es el 19 de noviembre 2025
const date = new Date('2025-11-19');
const utcDate = new Date('2025-11-19T00:00:00Z');

console.log('Fecha local:', date);
console.log('getDay() local:', date.getDay(), '=', ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][date.getDay()]);

console.log('\nFecha UTC:', utcDate);
console.log('getDay() UTC:', utcDate.getDay(), '=', ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][utcDate.getDay()]);

console.log('\nISO local:', date.toISOString());
console.log('ISO UTC:', utcDate.toISOString());
