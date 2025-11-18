// backend/src/helpers/availability.helper.js

const SLOT_REGEX = /^([01]?\d|2[0-3]):[0-5]\d$/;

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Normaliza un string de hora a formato HH:MM
 */
export const normalizeTime = (time) => {
  if (!time || typeof time !== 'string') return null;
  const trimmed = time.trim();
  if (!SLOT_REGEX.test(trimmed)) return null;
  
  const [hours, minutes] = trimmed.split(":");
  return `${hours.padStart(2, "0")}:${minutes}`;
};

/**
 * Convierte tiempo HH:MM a minutos desde medianoche
 */
export const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Valida que un bloque horario sea válido
 */
export const validateTimeBlock = (block) => {
  const errors = [];
  
  if (!block.startTime) {
    errors.push('startTime es requerido');
  } else if (!normalizeTime(block.startTime)) {
    errors.push('startTime inválido (formato: HH:MM)');
  }
  
  if (!block.endTime) {
    errors.push('endTime es requerido');
  } else if (!normalizeTime(block.endTime)) {
    errors.push('endTime inválido (formato: HH:MM)');
  }
  
  if (block.startTime && block.endTime) {
    const start = timeToMinutes(normalizeTime(block.startTime));
    const end = timeToMinutes(normalizeTime(block.endTime));
    
    if (start >= end) {
      errors.push('La hora de inicio debe ser menor que la hora de fin');
    }
  }
  
  if (block.slotDuration && (block.slotDuration < 5 || block.slotDuration > 480)) {
    errors.push('slotDuration debe estar entre 5 y 480 minutos');
  }
  
  return errors;
};

/**
 * Detecta traslapes entre bloques horarios
 */
export const detectOverlaps = (blocks) => {
  const normalized = blocks
    .filter(b => b.startTime && b.endTime)
    .map(b => ({
      ...b,
      startMinutes: timeToMinutes(normalizeTime(b.startTime)),
      endMinutes: timeToMinutes(normalizeTime(b.endTime)),
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes);
  
  const overlaps = [];
  
  for (let i = 0; i < normalized.length - 1; i++) {
    const current = normalized[i];
    const next = normalized[i + 1];
    
    if (current.endMinutes > next.startMinutes) {
      overlaps.push({
        block1: `${current.startTime}-${current.endTime}`,
        block2: `${next.startTime}-${next.endTime}`,
      });
    }
  }
  
  return overlaps;
};

/**
 * 🆕 Elimina bloques redundantes y fusiona traslapes
 */
export const removeOverlappingBlocks = (blocks) => {
  if (!blocks || blocks.length === 0) return [];
  
  const normalized = blocks
    .filter(b => b.startTime && b.endTime)
    .map(b => ({
      ...b,
      startMinutes: timeToMinutes(normalizeTime(b.startTime)),
      endMinutes: timeToMinutes(normalizeTime(b.endTime)),
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes);
  
  const result = [];
  let current = normalized[0];
  
  for (let i = 1; i < normalized.length; i++) {
    const next = normalized[i];
    
    // Si el siguiente bloque está completamente contenido en el actual, ignorarlo
    if (next.endMinutes <= current.endMinutes) {
      console.log(`🧹 Eliminando bloque contenido: ${next.startTime}-${next.endTime} dentro de ${current.startTime}-${current.endTime}`);
      continue;
    }
    
    // Si hay traslape, fusionar los bloques
    if (current.endMinutes > next.startMinutes) {
      console.log(`🔗 Fusionando bloques traslapados: ${current.startTime}-${current.endTime} con ${next.startTime}-${next.endTime}`);
      current.endMinutes = Math.max(current.endMinutes, next.endMinutes);
      const endHours = Math.floor(current.endMinutes / 60);
      const endMins = current.endMinutes % 60;
      current.endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
      continue;
    }
    
    // No hay traslape, agregar el bloque actual y continuar con el siguiente
    result.push({
      startTime: current.startTime,
      endTime: current.endTime,
      slotDuration: current.slotDuration || 30,
    });
    current = next;
  }
  
  // Agregar el último bloque
  result.push({
    startTime: current.startTime,
    endTime: current.endTime,
    slotDuration: current.slotDuration || 30,
  });
  
  return result;
};

/**
 * Normaliza y valida availability completo
 */
export const normalizeAvailability = (availability = []) => {
  if (!Array.isArray(availability)) return [];
  
  const result = [];
  const seenDays = new Set();
  
  for (const entry of availability) {
    const day = entry?.dayOfWeek;
    
    // Validar día
    if (!day || !DAY_ORDER.includes(day)) continue;
    if (seenDays.has(day)) continue; // Evitar duplicados
    seenDays.add(day);
    
    const normalized = {
      dayOfWeek: day,
      isClosed: !!entry.isClosed,
      timeBlocks: [],
      slots: [], // Compatibilidad
    };
    
    // Si está cerrado, no procesar bloques
    if (normalized.isClosed) {
      result.push(normalized);
      continue;
    }
    
    // Procesar timeBlocks (nuevo formato)
    if (Array.isArray(entry.timeBlocks)) {
      const validBlocks = [];
      
      for (const block of entry.timeBlocks) {
        const errors = validateTimeBlock(block);
        if (errors.length > 0) continue; // Ignorar bloques inválidos
        
        validBlocks.push({
          startTime: normalizeTime(block.startTime),
          endTime: normalizeTime(block.endTime),
          slotDuration: Math.max(5, Math.min(480, parseInt(block.slotDuration) || 30)),
        });
      }
      
      // 🆕 ELIMINAR DUPLICADOS: Bloques con mismo startTime y endTime
      const uniqueBlocks = [];
      const seen = new Set();
      
      for (const block of validBlocks) {
        const key = `${block.startTime}-${block.endTime}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueBlocks.push(block);
        } else {
          console.log(`🧹 Eliminando bloque duplicado en ${day}: ${key}`);
        }
      }
      
      // 🆕 ELIMINAR TRASLAPES: Fusionar bloques traslapados
      const cleanBlocks = removeOverlappingBlocks(uniqueBlocks);
      
      // Verificar si aún hay traslapes (no debería haber)
      const overlaps = detectOverlaps(cleanBlocks);
      if (overlaps.length > 0) {
        console.warn(`⚠️ Traslapes persistentes en ${day} (después de limpieza):`, overlaps);
      } else if (cleanBlocks.length < uniqueBlocks.length) {
        console.log(`✅ Limpieza exitosa en ${day}: ${uniqueBlocks.length} bloques → ${cleanBlocks.length} bloques`);
      }
      
      normalized.timeBlocks = cleanBlocks;
    }
    
    // Mantener compatibilidad con formato antiguo (slots)
    if (Array.isArray(entry.slots)) {
      const validSlots = entry.slots
        .map(s => normalizeTime(s))
        .filter(Boolean)
        .sort();
      
      normalized.slots = Array.from(new Set(validSlots));
    }
    
    result.push(normalized);
  }
  
  // Ordenar por día de la semana
  return result.sort((a, b) => 
    DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  );
};

/**
 * Genera slots individuales desde timeBlocks
 */
export const generateSlotsFromBlocks = (timeBlocks) => {
  const slots = [];
  
  console.log(`🔍 generateSlotsFromBlocks recibió ${timeBlocks.length} bloques`);
  
  for (const block of timeBlocks) {
    // 🔧 FIX: Convertir Mongoose subdocument a objeto plano
    const plainBlock = block._doc || block.toObject?.() || block;
    
    console.log(`🔍 Bloque plano:`, plainBlock);
    
    const startMinutes = timeToMinutes(plainBlock.startTime);
    const endMinutes = timeToMinutes(plainBlock.endTime);
    const duration = plainBlock.slotDuration || 30;
    
    console.log(`   ${plainBlock.startTime} → ${plainBlock.endTime} (cada ${duration}min)`);
    console.log(`   startMinutes: ${startMinutes}, endMinutes: ${endMinutes}`);
    
    if (isNaN(startMinutes) || isNaN(endMinutes)) {
      console.error(`❌ Error: startMinutes o endMinutes es NaN`);
      continue;
    }
    
    let count = 0;
    for (let minutes = startMinutes; minutes < endMinutes; minutes += duration) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const slot = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      slots.push(slot);
      count++;
      if (count > 100) {
        console.error(`❌ Loop infinito detectado`);
        break;
      }
    }
    
    console.log(`   ✅ ${count} slots generados`);
  }
  
  console.log(`✅ Total: ${slots.length} slots`, slots.length > 0 ? `[${slots[0]} ... ${slots[slots.length-1]}]` : '[]');
  
  return slots.sort();
};

/**
 * Migra formato antiguo (slots) a nuevo (timeBlocks)
 */
export const migrateOldFormat = (availability) => {
  return availability.map(entry => {
    // Si ya tiene timeBlocks, no hacer nada
    if (entry.timeBlocks && entry.timeBlocks.length > 0) {
      return entry;
    }
    
    // Si solo tiene slots, convertir a un bloque genérico
    if (entry.slots && entry.slots.length > 0) {
      const slots = entry.slots.map(s => normalizeTime(s)).filter(Boolean).sort();
      
      if (slots.length > 0) {
        // Crear un bloque que cubra desde el primer hasta el último slot
        return {
          ...entry,
          timeBlocks: [{
            startTime: slots[0],
            endTime: slots[slots.length - 1],
            slotDuration: 30,
          }],
        };
      }
    }
    
    return entry;
  });
};

// =================== NUEVAS FUNCIONES PARA SPECIAL DAYS ===================

const DAY_FROM_INDEX = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

/**
 * Normaliza una fecha a medianoche UTC para comparaciones
 */
export const normalizeDateOnly = (dateInput) => {
  if (!dateInput) return null;
  
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/**
 * Obtiene el availability para una fecha específica
 * Considera specialDays que overridean el horario semanal
 * 
 * @param {Date} date - Fecha específica
 * @param {Array} bookingAvailability - Horarios semanales
 * @param {Array} specialDays - Excepciones/días especiales
 * @returns {Object} { isClosed, timeBlocks, reason }
 */
export const getAvailabilityForDate = (date, bookingAvailability = [], specialDays = []) => {
  const normalizedDate = normalizeDateOnly(date);
  if (!normalizedDate) {
    return { isClosed: true, timeBlocks: [], reason: "Fecha inválida" };
  }
  
  // 1. Verificar si hay un specialDay para esta fecha
  const specialDay = specialDays.find(sd => {
    const sdDate = normalizeDateOnly(sd.date);
    return sdDate && sdDate.getTime() === normalizedDate.getTime();
  });
  
  if (specialDay) {
    console.log(`🎯 SpecialDay encontrado para ${normalizedDate.toISOString().split('T')[0]}:`, specialDay);
    // Día especial encontrado - usa su configuración
    return {
      isClosed: !!specialDay.isClosed,
      timeBlocks: specialDay.timeBlocks || [],
      reason: specialDay.reason || "",
      isSpecialDay: true,
    };
  }
  
  // 2. Si no hay specialDay, usar horario semanal
  const dayIndex = normalizedDate.getDay();
  const dayName = DAY_FROM_INDEX[dayIndex];
  
  const weeklyAvailability = bookingAvailability.find(
    av => av.dayOfWeek === dayName
  );
  
  if (!weeklyAvailability) {
    console.log(`⚠️ No hay configuración para ${dayName} en bookingAvailability`);
    return { isClosed: true, timeBlocks: [], reason: "Sin horario configurado" };
  }

  console.log(`📋 Configuración encontrada para ${dayName}:`, {
    isClosed: weeklyAvailability.isClosed,
    hasTimeBlocks: !!weeklyAvailability.timeBlocks?.length,
    hasSlots: !!weeklyAvailability.slots?.length,
    timeBlocks: weeklyAvailability.timeBlocks,
    slots: weeklyAvailability.slots,
  });

  // 🆕 MIGRACIÓN AUTOMÁTICA: Si solo tiene slots, convertir a timeBlocks
  let timeBlocks = weeklyAvailability.timeBlocks || [];
  
  if (timeBlocks.length === 0 && weeklyAvailability.slots && weeklyAvailability.slots.length > 0) {
    // Convertir slots antiguos a timeBlocks
    const slots = weeklyAvailability.slots.map(s => normalizeTime(s)).filter(Boolean).sort();
    
    if (slots.length > 0) {
      // Crear un bloque desde el primer slot hasta 30min después del último
      const firstSlot = slots[0];
      const lastSlot = slots[slots.length - 1];
      const lastSlotMinutes = timeToMinutes(lastSlot);
      const endMinutes = lastSlotMinutes + 30;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
      
      timeBlocks = [{
        startTime: firstSlot,
        endTime: endTime,
        slotDuration: 30,
      }];
      
      console.log(`🔄 Migración automática de ${slots.length} slots a timeBlock para ${dayName}:`, timeBlocks[0]);
    }
  }

  // 🆕 VERIFICAR SI HAY BLOQUES VÁLIDOS
  if (timeBlocks.length === 0) {
    console.warn(`⚠️ ${dayName} no tiene timeBlocks válidos`);
    return { isClosed: true, timeBlocks: [], reason: "Sin bloques de horario configurados" };
  }
  
  return {
    isClosed: !!weeklyAvailability.isClosed,
    timeBlocks,
    reason: weeklyAvailability.isClosed ? "Cerrado" : "",
    isSpecialDay: false,
  };
};

/**
 * Obtiene slots disponibles para una fecha específica
 * Considera bookings existentes y serviceDuration
 * 
 * @param {Date} date - Fecha específica
 * @param {Array} bookingAvailability - Horarios semanales
 * @param {Array} specialDays - Excepciones
 * @param {Array} existingBookings - Bookings ya agendados para esa fecha
 * @param {Number} serviceDuration - Duración del servicio (default 30)
 * @returns {Array} Slots disponibles ["09:00", "09:30", ...]
 */
export const getAvailableSlotsForDate = (
  date,
  bookingAvailability,
  specialDays,
  existingBookings = [],
  serviceDuration = 30
) => {
  const availability = getAvailabilityForDate(date, bookingAvailability, specialDays);
  
  if (availability.isClosed || availability.timeBlocks.length === 0) {
    return [];
  }
  
  // Generar todos los slots posibles
  let allSlots = [];
  for (const block of availability.timeBlocks) {
    const blockSlots = generateSlotsFromBlocks([{
      ...block,
      slotDuration: serviceDuration, // Usar duración del servicio
    }]);
    console.log(`🔧 Generando slots para bloque ${block.startTime}-${block.endTime} con duración ${serviceDuration}min:`, blockSlots);
    allSlots = [...allSlots, ...blockSlots];
  }
  
  console.log(`📊 Total slots generados: ${allSlots.length}`, allSlots);
  
  // Filtrar slots ya ocupados
  const bookedSlots = new Set(existingBookings.map(b => b.slot));
  const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot));
  
  console.log(`✅ Slots disponibles después de filtrar: ${availableSlots.length}`, availableSlots);
  
  return availableSlots.sort();
};

/**
 * Normaliza y valida specialDays
 */
export const normalizeSpecialDays = (specialDays = []) => {
  if (!Array.isArray(specialDays)) return [];
  
  const result = [];
  const seenDates = new Set();
  
  for (const entry of specialDays) {
    const date = normalizeDateOnly(entry.date);
    if (!date) continue;
    
    const dateKey = date.toISOString().split('T')[0];
    if (seenDates.has(dateKey)) continue; // Evitar duplicados
    seenDates.add(dateKey);
    
    const normalized = {
      date,
      isClosed: !!entry.isClosed,
      reason: (entry.reason || "").trim(),
      timeBlocks: [],
    };
    
    // Si no está cerrado, procesar timeBlocks
    if (!normalized.isClosed && Array.isArray(entry.timeBlocks)) {
      const validBlocks = [];
      
      for (const block of entry.timeBlocks) {
        const errors = validateTimeBlock(block);
        if (errors.length > 0) continue;
        
        validBlocks.push({
          startTime: normalizeTime(block.startTime),
          endTime: normalizeTime(block.endTime),
          slotDuration: Math.max(5, Math.min(480, parseInt(block.slotDuration) || 30)),
        });
      }
      
      normalized.timeBlocks = validBlocks;
    }
    
    result.push(normalized);
  }
  
  // Ordenar por fecha
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
};
