-- Database guarantee that no two articles share a cover photo, even when two
-- runs choose at the same moment. Run once in the Supabase SQL Editor.
--
-- Matches on the Pexels photo id, so different sizes of one photo still count
-- as the same image. Other URLs match without their query string. The app logic
-- lives in pexelsPhotoKey() in src/lib/ai/pexels.ts; keep the two in step.
--
-- This fails with "could not create unique index" if duplicates already exist.
-- Fix them first with POST /api/admin/unique-covers, then run this again.
create unique index if not exists articles_cover_photo_key
  on public.articles (
    coalesce(
      substring(cover_image_url from '/photos/([0-9]+)/'),
      split_part(cover_image_url, '?', 1)
    )
  )
  where cover_image_url is not null;
