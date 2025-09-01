-- Update the profile creation trigger to handle user_type from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'user_type', 'founder')::user_type
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
