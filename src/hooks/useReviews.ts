import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  imageUrls?: string[];
  createdAt: Date;
  isVisible: boolean;
  orderId?: string;
}

interface ReviewFilter {
  productId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  isVisible?: boolean;
}

const GET_REVIEWS = gql`
  query GetReviews($filter: ReviewFilterInput) {
    reviews(filter: $filter) {
      _id
      productId
      userId
      rating
      title
      comment
      imageUrls
      createdAt
      isVisible
      orderId
    }
  }
`;

const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!) {
    productReviews(productId: $productId) {
      _id
      productId
      userId
      rating
      title
      comment
      imageUrls
      createdAt
      isVisible
      orderId
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      _id
      productId
      userId
      rating
      title
      comment
      imageUrls
      createdAt
      isVisible
      orderId
    }
  }
`;

const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $input: UpdateReviewInput!) {
    updateReview(id: $id, input: $input) {
      _id
      rating
      title
      comment
      imageUrls
      isVisible
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id) {
      _id
      success
    }
  }
`;

export function useReviews(filter?: ReviewFilter) {
  const { data, loading, error } = useQuery(GET_REVIEWS, {
    variables: { filter },
  });

  return {
    reviews: data?.reviews as Review[],
    loading,
    error,
  };
}

export function useProductReviews(productId: string) {
  const { data, loading, error } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: { productId },
  });

  return {
    reviews: data?.productReviews as Review[],
    loading,
    error,
  };
}

export function useReviewMutations() {
  const [createReviewMutation] = useMutation(CREATE_REVIEW);
  const [updateReviewMutation] = useMutation(UPDATE_REVIEW);
  const [deleteReviewMutation] = useMutation(DELETE_REVIEW);

  const createReview = async (input: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
    imageUrls?: string[];
    orderId?: string;
  }) => {
    const { data } = await createReviewMutation({
      variables: { input },
    });
    return data.createReview;
  };

  const updateReview = async (
    id: string,
    input: {
      rating?: number;
      title?: string;
      comment?: string;
      imageUrls?: string[];
      isVisible?: boolean;
    }
  ) => {
    const { data } = await updateReviewMutation({
      variables: { id, input },
    });
    return data.updateReview;
  };

  const deleteReview = async (id: string) => {
    const { data } = await deleteReviewMutation({
      variables: { id },
    });
    return data.deleteReview;
  };

  return {
    createReview,
    updateReview,
    deleteReview,
  };
}
