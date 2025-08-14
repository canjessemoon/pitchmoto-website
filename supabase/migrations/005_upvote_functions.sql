-- Function to increment upvote count
CREATE OR REPLACE FUNCTION increment_upvote_count(pitch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE pitches 
  SET upvote_count = upvote_count + 1 
  WHERE id = pitch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement upvote count
CREATE OR REPLACE FUNCTION decrement_upvote_count(pitch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE pitches 
  SET upvote_count = GREATEST(upvote_count - 1, 0)
  WHERE id = pitch_id;
END;
$$ LANGUAGE plpgsql;
