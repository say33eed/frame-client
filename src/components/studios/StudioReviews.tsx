"use client";
import { useCallback, useEffect, useState } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

type Review = { _id: string; userId: string; name?: string; rating: number; comment: string; createdAt?: string };
type ReviewsResponse = { reviews: Review[]; rating: number | null; reviewCount: number };
type Eligibility = { eligible: boolean; myReview: Review | null };

export default function StudioReviews({ studioId, onChanged }: { studioId: string; onChanged: () => void }) {
  const { data: session } = authClient.useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [eligible, setEligible] = useState(false);
  const [mine, setMine] = useState<Review | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const result = await apiRequest<ReviewsResponse>(`/api/reviews/studio/${encodeURIComponent(studioId)}`, { cache: "no-store" });
    if (result.success) {
      setReviews(result.data.reviews);
      setRating(result.data.rating);
      setCount(result.data.reviewCount);
      setError("");
    } else setError(result.message);
  }, [studioId]);

  const loadEligibility = useCallback(async () => {
    const result = await apiRequest<Eligibility>(`/api/reviews/studio/${encodeURIComponent(studioId)}/eligibility`, { cache: "no-store" });
    if (result.success) {
      setEligible(result.data.eligible);
      setMine(result.data.myReview);
    } else { setEligible(false); setMine(null); }
  }, [studioId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) return load();
    });
    return () => { cancelled = true; };
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    const signedIn = Boolean(session?.user?.id);
    void Promise.resolve().then(() => {
      if (cancelled) return;
      if (signedIn) return loadEligibility();
      setEligible(false);
      setMine(null);
    });
    return () => { cancelled = true; };
  }, [session?.user?.id, loadEligibility]);

  function startEdit() {
    if (!mine) return;
    setStars(mine.rating);
    setComment(mine.comment);
    setEditing(true);
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    const result = await apiRequest<{ review: Review }>(
      editing && mine ? `/api/reviews/${mine._id}` : `/api/reviews/studio/${encodeURIComponent(studioId)}`,
      { method: editing && mine ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: stars, comment }) },
    );
    setBusy(false);
    if (!result.success) { toast.error(result.message); return; }
    toast.success(editing ? "Review updated." : "Review published.");
    setEditing(false); setComment(""); setStars(5);
    await Promise.all([load(), loadEligibility()]);
    onChanged();
  }

  async function remove() {
    if (!mine || busy || !window.confirm("Delete your review?")) return;
    setBusy(true);
    const result = await apiRequest<{ message: string }>(`/api/reviews/${mine._id}`, { method: "DELETE" });
    setBusy(false);
    if (!result.success) { toast.error(result.message); return; }
    toast.success("Review deleted.");
    setEditing(false); setComment("");
    await Promise.all([load(), loadEligibility()]);
    onChanged();
  }

  return (
    <section id="creator-reviews" className="scroll-mt-28 rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-950 sm:p-7 dark:border-white/15 dark:bg-[#242426] dark:text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Creator Reviews ({count})</h2>
        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          {count > 0 && rating !== null ? <span className="inline-flex items-center gap-1"><Star size={16} className="fill-[#E60023] text-[#E60023]" />{rating.toFixed(1)} / 5</span> : "Not yet rated"}
        </span>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {reviews.length ? (
        <div className="mt-5 space-y-5">
          {reviews.map((review) => (
            <div key={review._id} className="border-t border-neutral-200 pt-4 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{review.name || "Frame creator"}</p>
                <span className="inline-flex items-center gap-1 text-sm"><Star size={14} className="fill-[#E60023] text-[#E60023]" />{review.rating.toFixed(1)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-600 dark:text-neutral-300">{review.comment}</p>
              {review.createdAt && <p className="mt-2 text-xs text-neutral-500">{new Date(review.createdAt).toLocaleDateString()}</p>}
            </div>
          ))}
        </div>
      ) : <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">No reviews yet. Be the first eligible creator to share your experience.</p>}

      {session?.user?.id && mine && !editing && (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-neutral-200 pt-5 dark:border-white/10">
          <button type="button" onClick={startEdit} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:border-[#E60023] dark:border-white/20"><Pencil size={15} />Edit my review</button>
          <button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:border-[#E60023] disabled:opacity-50 dark:border-white/20"><Trash2 size={15} />Delete</button>
        </div>
      )}
      {session?.user?.id && eligible && (!mine || editing) && (
        <div className="mt-6 space-y-4 border-t border-neutral-200 pt-5 dark:border-white/10">
          <h3 className="font-semibold">{editing ? "Edit your review" : "Write a review"}</h3>
          <div role="group" aria-label="Star rating" className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setStars(n)} aria-label={`${n} star${n === 1 ? "" : "s"}`} aria-pressed={stars === n} className="rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-[#E60023]"><Star size={26} className={n <= stars ? "fill-[#E60023] text-[#E60023]" : "text-neutral-400"} /></button>)}
          </div>
          <label htmlFor="frame-review-text" className="block text-sm font-medium">Your experience</label>
          <textarea id="frame-review-text" value={comment} onChange={(event) => setComment(event.target.value)} minLength={10} maxLength={1500} rows={4} placeholder="Share what your studio session was like (at least 10 characters)." className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-950 focus:border-[#E60023] focus:outline-none dark:border-white/20 dark:bg-neutral-900 dark:text-white" />
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={busy || comment.trim().length < 10} onClick={() => void save()} className="rounded-full bg-[#E60023] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#C9001F] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Saving..." : editing ? "Save changes" : "Publish review"}</button>
            {editing && <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold dark:border-white/20">Cancel</button>}
          </div>
        </div>
      )}
      {session?.user?.id && !eligible && !mine && <p className="mt-5 text-sm text-neutral-500 dark:text-neutral-400">Reviews become available after your confirmed studio booking has ended.</p>}
      {!session?.user?.id && <p className="mt-5 text-sm text-neutral-500 dark:text-neutral-400">Sign in after completing a confirmed booking to leave a review.</p>}
    </section>
  );
}
