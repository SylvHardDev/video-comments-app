"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
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

export default function VideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState<{ name: string; url: string } | null>(
    null
  );
  const [comments, setComments] = useState<
    { id: string; text: string; timestamp: number }[]
  >([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("name, url")
        .eq("id", id)
        .single();
      if (error) console.error("Erreur récupération vidéo :", error.message);
      else setVideo(data);
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
    const { data, error } = await supabase
      .from("comments")
      .insert([{ video_id: id, text: newComment, timestamp: currentTime }]);
    if (error) console.error("Erreur ajout commentaire :", error.message);
    else {
      setComments([
        ...comments,
        { id: data[0].id, text: newComment, timestamp: currentTime },
      ]);
      setNewComment("");
      setIsModalOpen(false);
    }
  };

  if (!video) return <p>Chargement...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{video.name}</h1>
      <div className="relative">
        {/* Vidéo avec mise à jour du temps */}
        <video
          ref={videoRef}
          className="w-full rounded-lg"
          controls
          onPause={(e) => setCurrentTime(e.currentTarget.currentTime)}
        >
          <source src={video.url} type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>

        {/* Bouton Commenter en haut à droite */}
        <Button
          className="absolute top-2 right-2"
          onClick={() => setIsModalOpen(true)}
        >
          Commenter
        </Button>
      </div>

      {/* Barre de progression avec commentaires */}
      <div className="relative mt-4 h-2 bg-gray-300 rounded-full overflow-hidden">
        {comments.map((comment) => (
          <TooltipProvider key={comment.id}>
            <Tooltip>
              <TooltipTrigger
                className="absolute h-2 w-1 bg-red-500"
                style={{
                  left: videoRef.current
                    ? `${
                        (comment.timestamp / videoRef.current.duration) * 100
                      }%`
                    : "0%",
                }}
              />
              <TooltipContent>
                <p>{comment.text}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
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

      {/* Liste des commentaires */}
      <h2 className="text-xl font-semibold mt-6">Commentaires</h2>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id} className="p-2 border-b">
            <span className="text-gray-500">
              {Math.floor(comment.timestamp)}s :
            </span>{" "}
            {comment.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
