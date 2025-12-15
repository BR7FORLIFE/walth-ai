import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase/client";
import { useRouter } from "next/navigation";

export default function useRedirectIfLogged() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            const { data } = await supabase.auth.getSession();
            if (data.session) router.push("/dashboard");
            setLoading(false);
        }

        checkSession();
    }, []);

    return loading;
}
