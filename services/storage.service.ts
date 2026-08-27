import { createClient } from '@/lib/supabase/client';

export const storageService = {
  async uploadImage(bucket: 'avatars' | 'news' | 'debates', file: File): Promise<string> {
    const supabase = createClient();

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen válida (JPG, PNG, WebP)');
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no puede superar los 5MB');
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deleteImage(bucket: 'avatars' | 'news' | 'debates', url: string): Promise<void> {
    const supabase = createClient();
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      if (fileName) {
        await supabase.storage.from(bucket).remove([fileName]);
      }
    } catch {
      // Ignorar errores de parseo de url
    }
  }
};
