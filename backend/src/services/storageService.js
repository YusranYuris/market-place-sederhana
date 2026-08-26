import { supabase } from "../config/supabase.js";
import crypto from "crypto";

const generateFileName = (originalName) => {
  const extension = originalName.split(".").pop();

  return `${crypto.randomUUID()}.${extension}`;
};

// Upload file
export const uploadFile = async ({
  bucket,
  folder,
  file
}) => {
  const fileName = generateFileName(file.originalname);

  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    path: data.path
  };
};

// Public URL
export const getPublicUrl = (bucket, filePath) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Signed URL
export const getSignedUrl = async (
  bucket,
  filePath,
  expiresIn = 3600
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
};

// Delete file
export const deleteFile = async (bucket, filePath) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};