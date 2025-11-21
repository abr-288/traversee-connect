import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setRole(data.role as 'admin' | 'user');
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading, isAdmin: role === 'admin' };
}
