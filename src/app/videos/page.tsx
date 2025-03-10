"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function VideosPage() {
  const [videos, setVideos] = useState<
    { id: string; name: string; url: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase.from("videos").select("*");
      if (error) {
        console.error(
          "Erreur lors de la récupération des vidéos :",
          error.message
        );
      } else {
        setVideos(data);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des vidéos</h1>
      {loading && <p>Chargement...</p>}
      <ul className="w-full max-w-2xl">
        {videos.map((video) => (
          <li key={video.id} className="mb-4 p-4 border rounded-lg">
            <h2 className="text-lg font-semibold">{video.name}</h2>
            <Link href={`/videos/${video.id}`} className="text-blue-500">
              Regarder
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
