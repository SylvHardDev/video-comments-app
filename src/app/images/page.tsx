"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function ImageGallery() {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from("images").list();
      if (error) {
        console.error("Erreur récupération images :", error.message);
        return;
      }

      const imageUrls = data.map((file) => ({
        name: file.name,
        url: supabase.storage.from("images").getPublicUrl(file.name).publicUrl,
      }));

      console.log("Images récupérées :", imageUrls); // Ajout du log
      setImages(imageUrls);
    };

    fetchImages();
  }, []);

  const handleUpload = async () => {
    if (!imageFile) {
      toast.error("Sélectionne une image avant d'uploader.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.storage
      .from("images") // Vérifie que le bucket "images" existe
      .upload(`uploads/${Date.now()}_${imageFile.name}`, imageFile);

    if (error) {
      console.error("Erreur upload :", error.message);
      toast.error(`Échec de l'upload : ${error.message}`); // Affiche l'erreur précise
      setLoading(false);
      return;
    }

    const newImageUrl = supabase.storage
      .from("images")
      .getPublicUrl(data.path).publicUrl;
    setImages([...images, { name: data.path, url: newImageUrl }]);
    toast.success("Image uploadée avec succès !");
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion des Images</h1>

      {/* Formulaire d'upload */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        <Button className="mt-2" onClick={handleUpload} disabled={loading}>
          {loading ? "Upload en cours..." : "Uploader l'image"}
        </Button>
      </div>

      {/* Liste des images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <Link
            key={image.name}
            href={`/images/edit?url=${encodeURIComponent(image.url)}`}
          >
            <Image
              src={image.url}
              alt="Image"
              width={150}
              height={150}
              className="cursor-pointer rounded-lg"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
