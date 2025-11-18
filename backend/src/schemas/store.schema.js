// backend/src/schemas/store.schema.js
import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  
  mode: z.enum(["products", "bookings"], {
    errorMap: () => ({ message: "El modo debe ser 'products' o 'bookings'" })
  }).optional(),
  
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
  
  comuna: z.string().max(50).optional(),
  tipoNegocio: z.string().max(50).optional(),
  direccion: z.string().max(200).optional(),
  
  lat: z.number()
    .min(-90, "Latitud inválida")
    .max(90, "Latitud inválida")
    .optional(),
  
  lng: z.number()
    .min(-180, "Longitud inválida")
    .max(180, "Longitud inválida")
    .optional(),
  
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color primario inválido").optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color de acento inválido").optional(),
  
  bgMode: z.enum(["solid", "gradient", "image"]).optional(),
  bgPattern: z.enum(["none", "dots", "grid", "noise"]).optional(),
  
  heroTitle: z.string().max(100).optional(),
  heroSubtitle: z.string().max(200).optional(),
  priceFrom: z.string().max(50).optional(),
});

export const updateStoreSchema = createStoreSchema.partial();

export const productSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  
  description: z.string().max(1000, "La descripción no puede exceder 1000 caracteres").optional(),
  
  price: z.number()
    .min(0, "El precio no puede ser negativo")
    .max(99999999, "Precio demasiado alto"),
  
  stock: z.number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo")
    .optional(),
  
  images: z.array(z.string().url("URL de imagen inválida")).optional(),
});
