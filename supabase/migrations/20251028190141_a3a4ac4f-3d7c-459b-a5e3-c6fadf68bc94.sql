-- Create trigger to automatically assign 'user' role to new users
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Insert admin role for existing users if needed
-- Note: This is just a placeholder, users need to manually set admin role via backend