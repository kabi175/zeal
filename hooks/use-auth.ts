"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser, Profile, AppRole } from "@/types/app";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setUser(null); setLoading(false); return; }

      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", authUser.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", authUser.id).single(),
      ]);

      setUser({
        id: authUser.id,
        email: authUser.email ?? "",
        profile: (profileRes.data as Profile | null) ?? null,
        role: ((roleRes.data as { role: AppRole } | null)?.role) ?? null,
      });
      setLoading(false);
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
