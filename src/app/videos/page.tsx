"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // Icône de chargement
import { Skeleton } from "@/components/ui/skeleton";

export default function VideoListPage() {
  const [videos, setVideos] = useState<
    { id: string; name: string; url: string }[]
  >([]);
  const [videoName, setVideoName] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // État pour le loader
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, name, url");
      if (error) console.error("Erreur récupération vidéos :", error.message);
      else setVideos(data);
      setLoading(false);
    };

    fetchVideos();
  }, []);

  const handleUpload = async () => {
    if (!videoFile || !videoName) {
      toast.error("Veuillez sélectionner un fichier et entrer un nom.");
      return;
    }

    setIsLoading(true); // Activer le loader

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(`${Date.now()}_${videoFile.name}`, videoFile);

    if (error) {
      console.error("Erreur upload :", error.message);
      toast.error("Échec de l'upload.");
      setIsLoading(false); // Désactiver le loader en cas d'erreur
      return;
    }

    const url = `${
      supabase.storage.from("videos").getPublicUrl(data.path).publicUrl
    }`;

    await supabase.from("videos").insert([{ name: videoName, url }]);

    setVideos([...videos, { id: Date.now().toString(), name: videoName, url }]);
    setVideoName("");
    setVideoFile(null);
    setIsLoading(false); // Désactiver le loader après l'upload
    setIsModalOpen(false);
    toast.success("Vidéo ajoutée avec succès !");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      {/* Bouton Ajouter une vidéo en haut à droite */}
      <div className="absolute top-6 right-6">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              + Ajouter une vidéo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle vidéo</DialogTitle>
            </DialogHeader>
            <Label>Nom de la vidéo</Label>
            <Input
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder="Ex: Présentation"
            />
            <Label className="mt-2">Fichier vidéo</Label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />

            {/* Bouton avec loader */}
            <Button
              className="mt-4 w-full"
              onClick={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upload en
                  cours...
                </>
              ) : (
                "Uploader"
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <h1 className="text-2xl font-bold mb-6">Liste des Vidéos</h1>

      {loading ? (
        // Skeleton pour le chargement de la liste des vidéos
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : (
        /* Liste des vidéos */
        <div>
          {videos.map((video) => (
            <Card key={video.id} className="mb-4">
              <CardHeader
                onClick={() =>
                  setVideos(
                    videos.map((v) =>
                      v.id === video.id ? { ...v, expanded: !v.expanded } : v
                    )
                  )
                }
              >
                <CardTitle className="cursor-pointer">{video.name}</CardTitle>
              </CardHeader>
              {video.expanded && (
                <CardContent>
                  <video className="w-full rounded-lg" controls>
                    <source src={video.url} type="video/mp4" />
                    Votre navigateur ne supporte pas la vidéo.
                  </video>
                  <Link href={`/videos/${video.id}`}>
                    <Button className="mt-2">Lire la vidéo</Button>
                  </Link>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
