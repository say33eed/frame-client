export function hasStudioRating(rating: number | null | undefined, reviewCount?: number | null): rating is number {
  return typeof rating === "number" && Number.isFinite(rating) && rating > 0 &&
    (reviewCount === undefined || reviewCount === null || reviewCount > 0);
}
