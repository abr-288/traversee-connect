
-- Fix critical: Prevent non-admin users from inserting into user_roles
-- Drop any existing permissive INSERT policy
DO $$
BEGIN
  -- Add explicit DENY INSERT policy for non-admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can insert roles'
  ) THEN
    CREATE POLICY "Only admins can insert roles"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  -- Add explicit DENY DELETE policy for non-admins  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can delete roles'
  ) THEN
    CREATE POLICY "Only admins can delete roles"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
