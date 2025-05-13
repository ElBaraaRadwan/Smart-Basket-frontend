import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

interface Wishlist {
  _id: string;
  userId: string;
  productIds: string[];
  updatedAt: Date;
  createdAt: Date;
}

const GET_WISHLIST = gql`
  query GetWishlist {
    wishlist {
      _id
      userId
      productIds
      updatedAt
      createdAt
    }
  }
`;

const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: ID!) {
    addToWishlist(productId: $productId) {
      _id
      userId
      productIds
      updatedAt
      createdAt
    }
  }
`;

const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: ID!) {
    removeFromWishlist(productId: $productId) {
      _id
      userId
      productIds
      updatedAt
      createdAt
    }
  }
`;

const CLEAR_WISHLIST = gql`
  mutation ClearWishlist {
    clearWishlist {
      _id
      userId
      productIds
      updatedAt
      createdAt
    }
  }
`;

export function useWishlist() {
  const { data, loading, error } = useQuery(GET_WISHLIST);
  const [addToWishlistMutation] = useMutation(ADD_TO_WISHLIST);
  const [removeFromWishlistMutation] = useMutation(REMOVE_FROM_WISHLIST);
  const [clearWishlistMutation] = useMutation(CLEAR_WISHLIST);

  const wishlist = data?.wishlist as Wishlist | undefined;

  const addToWishlist = async (productId: string) => {
    await addToWishlistMutation({
      variables: { productId },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: GET_WISHLIST,
          data: { wishlist: data.addToWishlist },
        });
      },
    });
  };

  const removeFromWishlist = async (productId: string) => {
    await removeFromWishlistMutation({
      variables: { productId },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: GET_WISHLIST,
          data: { wishlist: data.removeFromWishlist },
        });
      },
    });
  };

  const clearWishlist = async () => {
    await clearWishlistMutation({
      update: (cache, { data }) => {
        cache.writeQuery({
          query: GET_WISHLIST,
          data: { wishlist: data.clearWishlist },
        });
      },
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist?.productIds.includes(productId) ?? false;
  };

  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  };
}
