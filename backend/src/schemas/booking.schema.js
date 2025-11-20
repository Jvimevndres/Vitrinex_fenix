// backend/src/schemas/booking.schema.js
import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createBookingSchema = z.object({
  body: z.object({
    customerName: z
      .string({
        required_error: 'El nombre del cliente es requerido',
      })
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo'),
    
    customerEmail: z
      .string({
        required_error: 'El email es requerido',
      })
      .email('Email inválido'),
    
    customerPhone: z
      .string()
      .min(8, 'El teléfono debe tener al menos 8 caracteres')
      .max(20, 'El teléfono es demasiado largo')
      .optional(),
    
    date: z
      .string({
        required_error: 'La fecha es requerida',
      })
      .regex(dateRegex, 'Formato de fecha inválido. Use YYYY-MM-DD'),
    
    slot: z
      .string({
        required_error: 'El horario es requerido',
      })
      .regex(timeRegex, 'Formato de hora inválido. Use HH:MM'),
    
    service: z
      .string()
      .optional(),
    
    notes: z
      .string()
      .max(500, 'Las notas son demasiado largas')
      .optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
      required_error: 'El estado es requerido',
      invalid_type_error: 'Estado inválido',
    }),
  }),
});
