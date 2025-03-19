"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);

    const { error, data: session } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error("Échec de connexion : " + error.message);
      setLoading(false);
      return;
    }

    // Récupérer les infos de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", data.email)
      .single();

    if (userError) {
      toast.error("Erreur récupération utilisateur");
      setLoading(false);
      return;
    }

    toast.success("Connexion réussie !");
    setLoading(false);

    // Rediriger en fonction du rôle
    if (userData.role === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/user");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center w-[500px]">
      <div className="w-full max-w-md bg-white p-6 rounded-lg border">
        <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              {...register("email")}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input
              type="password"
              {...register("password")}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Se connecter"
            )}
          </Button>
          <p className="text-center mt-2 text-sm">
            <Link
              href="/reset-password"
              className="text-blue-500 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
