import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

interface CartItem {
  productId: string;
  quantity: number;
  variantId?: string;
  price: number;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  updatedAt: Date;
  createdAt: Date;
}

const GET_CART = gql`
  query GetCart {
    cart {
      _id
      userId
      items {
        productId
        quantity
        variantId
        price
      }
      updatedAt
      createdAt
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!, $variantId: ID) {
    addToCart(
      productId: $productId
      quantity: $quantity
      variantId: $variantId
    ) {
      _id
      userId
      items {
        productId
        quantity
        variantId
        price
      }
      updatedAt
      createdAt
    }
  }
`;

const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($productId: ID!, $quantity: Int!) {
    updateCartItem(productId: $productId, quantity: $quantity) {
      _id
      userId
      items {
        productId
        quantity
        variantId
        price
      }
      updatedAt
      createdAt
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      _id
      userId
      items {
        productId
        quantity
        variantId
        price
      }
      updatedAt
      createdAt
    }
  }
`;

export function useCart() {
  const { data, loading, error } = useQuery(GET_CART);
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM);
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART);

  const cart = data?.cart as Cart | undefined;

  const addToCart = async (
    productId: string,
    quantity: number = 1,
    variantId?: string
  ) => {
    await addToCartMutation({
      variables: { productId, quantity, variantId },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: GET_CART,
          data: { cart: data.addToCart },
        });
      },
    });
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    await updateCartItemMutation({
      variables: { productId, quantity },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: GET_CART,
          data: { cart: data.updateCartItem },
        });
      },
    });
  };

  const removeFromCart = async (productId: string) => {
    await removeFromCartMutation({
      variables: { productId },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: GET_CART,
          data: { cart: data.removeFromCart },
        });
      },
    });
  };

  const cartItemsCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const cartTotal =
    cart?.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ) || 0;

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItemsCount,
    cartTotal,
  };
}
