"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VideoListPage() {
  const [videos, setVideos] = useState<
    { id: string; name: string; url: string }[]
  >([]);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, name, url");
      if (error) console.error("Erreur récupération vidéos :", error.message);
      else setVideos(data);
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Liste des Vidéos</h1>
      {videos.map((video) => (
        <Card key={video.id} className="mb-4">
          <CardHeader
            onClick={() =>
              setExpandedVideo(expandedVideo === video.id ? null : video.id)
            }
          >
            <CardTitle className="cursor-pointer">{video.name}</CardTitle>
          </CardHeader>
          {expandedVideo === video.id && (
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
  );
}
