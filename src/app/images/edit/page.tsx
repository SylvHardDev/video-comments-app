"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function ImageEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const imageUrl = searchParams.get("url");
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [fabricModule, setFabricModule] = useState<any>(null);

  useEffect(() => {
    import("fabric").then((fabric) => {
      setFabricModule(fabric);
      if (imageUrl) {
        const canvas = new fabric.Canvas("canvas", {
          width: 600,
          height: 400,
          backgroundColor: "#ffffff",
        });

        fabric.Image.fromURL(imageUrl, (img) => {
          img.scaleToWidth(500);
          canvas.add(img);
          canvasRef.current = canvas;
        });

        return () => canvas.dispose();
      }
    });
  }, [imageUrl]);

  const addText = () => {
    if (!fabricModule || !canvasRef.current) return;
    const text = new fabricModule.Text("Texte ici", {
      left: 100,
      top: 100,
      fill: "black",
      fontSize: 20,
    });
    canvasRef.current.add(text);
  };

  const addEmoji = () => {
    if (!fabricModule || !canvasRef.current) return;
    const emoji = new fabricModule.Text("😊", {
      left: 150,
      top: 150,
      fontSize: 40,
    });
    canvasRef.current.add(emoji);
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
    });

    const blob = await (await fetch(dataUrl)).blob();
    const fileName = `edited-${Date.now()}.png`;

    const { error } = await supabase.storage
      .from("images")
      .upload(`edited/${fileName}`, blob);

    if (error) {
      toast.error("Erreur lors de l'enregistrement.");
    } else {
      toast.success("Image enregistrée avec succès !");
      router.push("/images");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Éditeur d'image</h1>
      <canvas id="canvas" className="border w-full"></canvas>

      <div className="mt-4 space-x-2">
        <Button onClick={addText}>Ajouter du texte</Button>
        <Button onClick={addEmoji}>Ajouter un emoji</Button>
        <Button onClick={saveImage} className="bg-green-500">
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
