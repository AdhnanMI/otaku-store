import { Star } from 'lucide-react';
import './StarRating.css';

export default function StarRating({ rating, reviews, size = 12 }) {
  return (
    <div className="star-rating">
      <Star size={size} />
      <span className="star-rating-value">{rating}</span>
      {reviews != null && <span className="star-rating-reviews">({reviews})</span>}
    </div>
  );
}
