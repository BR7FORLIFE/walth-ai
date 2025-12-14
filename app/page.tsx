"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession(){
      const { data } = await supabase.auth.getSession()

      if(data.session) router.push("/dashboard")
      else router.push("/landing")
    }
    
    checkSession()
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirigiendo...</p>
    </div>
  );
}
