"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const uploadVideo = async () => {
    if (!file) return;

    setUploading(true);
    setMessage("");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    // Upload dans Supabase Storage
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, file);

    if (error) {
      setMessage("Erreur lors de l'upload : " + error.message);
      setUploading(false);
      return;
    }

    // Récupérer l'URL de la vidéo stockée
    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);
    const videoUrl = publicUrlData.publicUrl;

    // Enregistrer dans la base de données
    const { error: dbError } = await supabase
      .from("videos")
      .insert([{ name: file.name, url: videoUrl }]);

    if (dbError) {
      setMessage(
        "Erreur lors de l'enregistrement en base : " + dbError.message
      );
    } else {
      setMessage("Vidéo uploadée avec succès !");
    }

    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">Uploader une vidéo</h1>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="mt-4"
      />
      <button
        onClick={uploadVideo}
        disabled={uploading || !file}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {uploading ? "Upload en cours..." : "Uploader"}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
