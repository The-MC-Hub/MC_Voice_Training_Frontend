import * as reviewService from "../services/reviewService";



export const fetchMCReviews = async (mcId) => {
  try {
    
    const result = await reviewService.getMCReviews(mcId);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }
};

export const submitReview = async (reviewData) => {
  
  return reviewService.createReview(reviewData);
};

export const editReview = async (id, reviewData) => {
  
  return reviewService.updateReview(id, reviewData);
};

export const removeReview = async (id) => {
  await reviewService.deleteReview(id);
};

export const computeReviewStats = (reviews) => {
  if (!reviews.length) return { average: 0, total: 0, distribution: {} };
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const distribution = {};
  for (let i = 1; i <= 5; i++) {
    distribution[i] = reviews.filter((r) => Math.round(r.rating) === i).length;
  }
  return { average: (sum / total).toFixed(1), total, distribution };
};
