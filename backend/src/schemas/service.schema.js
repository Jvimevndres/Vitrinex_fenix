// backend/src/schemas/service.schema.js
import { z } from 'zod';

export const createServiceSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'El nombre del servicio es requerido',
      })
      .min(1, 'El nombre no puede estar vacío')
      .max(100, 'El nombre es demasiado largo'),
    
    description: z
      .string()
      .max(500, 'La descripción es demasiado larga')
      .optional(),
    
    duration: z
      .number({
        required_error: 'La duración es requerida',
      })
      .int('La duración debe ser un número entero')
      .min(15, 'La duración mínima es 15 minutos')
      .max(480, 'La duración máxima es 8 horas'),
    
    price: z
      .number({
        required_error: 'El precio es requerido',
      })
      .min(0, 'El precio no puede ser negativo'),
    
    isActive: z
      .boolean()
      .optional()
      .default(true),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'El nombre no puede estar vacío')
      .max(100, 'El nombre es demasiado largo')
      .optional(),
    
    description: z
      .string()
      .max(500, 'La descripción es demasiado larga')
      .optional(),
    
    duration: z
      .number()
      .int('La duración debe ser un número entero')
      .min(15, 'La duración mínima es 15 minutos')
      .max(480, 'La duración máxima es 8 horas')
      .optional(),
    
    price: z
      .number()
      .min(0, 'El precio no puede ser negativo')
      .optional(),
    
    isActive: z
      .boolean()
      .optional(),
  }),
});
