-- Function to auto-create profile and loyalty points on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', NULL),
    COALESCE(new.raw_user_meta_data->>'last_name', NULL),
    COALESCE(new.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert loyalty points
  INSERT INTO public.loyalty_points (user_id, points, total_spent, tier)
  VALUES (new.id, 0, 0, 'bronze')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Trigger to call handle_new_user on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update loyalty tier based on total spent
CREATE OR REPLACE FUNCTION public.update_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.total_spent >= 1000 THEN
    NEW.tier := 'platinum';
  ELSIF NEW.total_spent >= 500 THEN
    NEW.tier := 'gold';
  ELSIF NEW.total_spent >= 200 THEN
    NEW.tier := 'silver';
  ELSE
    NEW.tier := 'bronze';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Trigger to update loyalty tier when points change
DROP TRIGGER IF EXISTS update_tier_on_points_change ON public.loyalty_points;

CREATE TRIGGER update_tier_on_points_change
  BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_tier();
