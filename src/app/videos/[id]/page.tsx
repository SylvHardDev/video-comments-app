"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ReactPlayer from "react-player";

type Comment = {
  id: string;
  timestamp: number;
  text: string;
};

export default function VideoPage() {
  const { id } = useParams(); // Récupère l'ID de la vidéo depuis l'URL
  const [video, setVideo] = useState<{ url: string } | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  let player: ReactPlayer | null = null;

  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) console.error("Erreur vidéo :", error.message);
      else setVideo(data);
      setLoading(false);
    };

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("video_id", id);
      if (error) console.error("Erreur commentaires :", error.message);
      else setComments(data);
    };

    fetchVideo();
    fetchComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const { error } = await supabase
      .from("comments")
      .insert([{ video_id: id, timestamp: currentTime, text: newComment }]);
    if (error) {
      console.error("Erreur lors de l'ajout du commentaire :", error.message);
    } else {
      setComments([
        ...comments,
        { id: Date.now().toString(), timestamp: currentTime, text: newComment },
      ]);
      setNewComment("");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Vidéo</h1>
          <ReactPlayer
            url={video?.url}
            controls
            onProgress={(state) => setCurrentTime(state.playedSeconds)}
            ref={(ref) => {
              player = ref;
            }}
            width="100%"
            height="auto"
          />
          <div className="mt-4 w-full max-w-2xl">
            <h2 className="text-lg font-semibold">Commentaires</h2>
            <ul className="mt-2">
              {comments.map((comment) => (
                <li key={comment.id} className="p-2 border-b">
                  <button
                    onClick={() => player?.seekTo(comment.timestamp, "seconds")}
                    className="text-blue-500"
                  >
                    {new Date(comment.timestamp * 1000)
                      .toISOString()
                      .substr(14, 5)}
                  </button>{" "}
                  - {comment.text}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="border p-2 w-full"
              />
              <button
                onClick={handleAddComment}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Ajouter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
