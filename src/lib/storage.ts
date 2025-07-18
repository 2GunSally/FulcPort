import { supabase } from './supabase';

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const filename = `${crypto.randomUUID()}.${file.type.split('/')[1]}`;
    
    // Try to upload to message-images bucket, if it fails, just return the data URL
    const { error } = await supabase.storage
      .from('message-images')
      .upload(filename, file, { upsert: false });
    
    if (error) {
      console.warn('Storage upload failed, using data URL instead:', error);
      // Convert file to data URL as fallback
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    return supabase.storage
      .from('message-images')
      .getPublicUrl(filename).data.publicUrl;
  } catch (error) {
    console.warn('Storage error, using data URL fallback:', error);
    // Fallback to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

export const uploadImageFromDataURL = async (dataURL: string): Promise<string> => {
  // Convert data URL to blob
  const response = await fetch(dataURL);
  const blob = await response.blob();
  
  // Create a file from the blob
  const file = new File([blob], 'image.png', { type: 'image/png' });
  
  return uploadImage(file);
};
