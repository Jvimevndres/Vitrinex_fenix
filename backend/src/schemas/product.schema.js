// backend/src/schemas/product.schema.js
import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'El nombre del producto es requerido',
      })
      .min(1, 'El nombre no puede estar vacío')
      .max(200, 'El nombre es demasiado largo'),
    
    description: z
      .string()
      .max(1000, 'La descripción es demasiado larga')
      .optional(),
    
    price: z
      .number({
        required_error: 'El precio es requerido',
      })
      .min(0, 'El precio no puede ser negativo'),
    
    stock: z
      .number()
      .int('El stock debe ser un número entero')
      .min(0, 'El stock no puede ser negativo')
      .optional()
      .default(0),
    
    images: z
      .array(z.string().url('URL de imagen inválida'))
      .max(10, 'Máximo 10 imágenes por producto')
      .optional(),
    
    category: z
      .string()
      .max(50, 'La categoría es demasiado larga')
      .optional(),
    
    isActive: z
      .boolean()
      .optional()
      .default(true),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'El nombre no puede estar vacío')
      .max(200, 'El nombre es demasiado largo')
      .optional(),
    
    description: z
      .string()
      .max(1000, 'La descripción es demasiado larga')
      .optional(),
    
    price: z
      .number()
      .min(0, 'El precio no puede ser negativo')
      .optional(),
    
    stock: z
      .number()
      .int('El stock debe ser un número entero')
      .min(0, 'El stock no puede ser negativo')
      .optional(),
    
    images: z
      .array(z.string().url('URL de imagen inválida'))
      .max(10, 'Máximo 10 imágenes por producto')
      .optional(),
    
    category: z
      .string()
      .max(50, 'La categoría es demasiado larga')
      .optional(),
    
    isActive: z
      .boolean()
      .optional(),
  }),
});
