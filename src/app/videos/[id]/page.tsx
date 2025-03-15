"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { toast } from "sonner";

export default function VideoPage() {
  const { id } = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<{ name: string; url: string } | null>(
    null
  );
  const [comments, setComments] = useState<
    { id: string; text: string; timestamp: number }[]
  >([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("name, url")
        .eq("id", id)
        .single();
      if (error) console.error("Erreur récupération vidéo :", error.message);
      else setVideo(data);
      setLoading(false);
    };

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, text, timestamp")
        .eq("video_id", id);
      if (error)
        console.error("Erreur récupération commentaires :", error.message);
      else setComments(data);
    };

    fetchVideo();
    fetchComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment) return;

    // Insérer le commentaire dans la base de données
    const { error } = await supabase
      .from("comments")
      .insert([{ video_id: id, text: newComment, timestamp: currentTime }]);

    if (error) {
      console.error("Erreur ajout commentaire :", error.message);
      toast.error("Erreur lors de l'ajout du commentaire.");
      return;
    }

    // Récupérer les commentaires mis à jour après l'insertion
    const { data: updatedComments, error: fetchError } = await supabase
      .from("comments")
      .select("id, text, timestamp")
      .eq("video_id", id)
      .order("timestamp", { ascending: true });

    if (fetchError) {
      console.error("Erreur récupération commentaires :", fetchError.message);
      toast.error("Impossible de récupérer les commentaires.");
      return;
    }

    setComments(updatedComments); // Mettre à jour la liste des commentaires
    setNewComment("");
    setIsModalOpen(false);
    toast.success("Commentaire ajouté !");
  };

  const handleSeekToComment = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "c" || event.key === "C") {
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (!video) return <p>Chargement...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto flex gap-6">
      {/* Section principale avec la vidéo */}
      <div className="w-2/3">
        {/* Bouton Retour */}
        <Link href="/videos">
          <Button className="mb-4">⬅ Retour aux vidéos</Button>
        </Link>

        <h1 className="text-2xl font-bold mb-4">{video.name}</h1>

        {/* Vidéo avec gestion pause/lecture */}
        <div className="relative">
          {document.fullscreenElement && (
            <Button
              className="absolute top-4 right-4 bg-white text-black p-2"
              onClick={() => setIsModalOpen(true)}
            >
              Commenter
            </Button>
          )}

          <video
            ref={videoRef}
            className="w-full rounded-lg"
            controls
            onPause={(e) => {
              setCurrentTime(e.currentTarget.currentTime);
              setIsPaused(true);
            }}
            onPlay={() => setIsPaused(false)}
          >
            <source src={video.url} type="video/mp4" />
            Votre navigateur ne supporte pas la vidéo.
          </video>

          {/* Bouton "Commenter" en mode pause uniquement */}
          {isPaused && (
            <Button
              className="absolute top-2 right-2"
              onClick={() => setIsModalOpen(true)}
            >
              Commenter
            </Button>
          )}
        </div>

        {/* Barre de progression avec marqueurs */}
        <div className="relative mt-2">
          <div className="w-full h-1 bg-gray-300 relative">
            {comments.map((comment) => (
              <TooltipProvider key={comment.id}>
                <Tooltip>
                  <TooltipTrigger
                    className="absolute h-1 w-2 bg-red-500"
                    style={{
                      left: videoRef.current
                        ? `${
                            (comment.timestamp / videoRef.current.duration) *
                            100
                          }%`
                        : "0%",
                    }}
                    onClick={() => handleSeekToComment(comment.timestamp)}
                  />
                  <TooltipContent>
                    <p>{comment.text}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>

      {/* Section de droite avec la liste des commentaires */}
      <div className="w-1/3 border-l pl-4">
        <h2 className="text-xl font-semibold mb-2">Commentaires</h2>
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
              onClick={() => handleSeekToComment(comment.timestamp)}
            >
              <span className="text-gray-500">
                {Math.floor(comment.timestamp)}s :
              </span>{" "}
              {comment.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Fenêtre modale pour ajouter un commentaire */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un commentaire</DialogTitle>
          </DialogHeader>
          <Input type="text" disabled value={`À ${Math.floor(currentTime)}s`} />
          <Textarea
            placeholder="Votre commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleAddComment}>Envoyer</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
