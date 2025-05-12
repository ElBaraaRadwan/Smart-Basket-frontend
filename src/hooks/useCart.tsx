import { gql, useQuery, useMutation } from "@apollo/client";

const GET_CART = gql`
  query GetCart {
    cart {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          images
          description
          stock
        }
      }
      total
      itemCount
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($input: AddCartItemInput!) {
    addToCart(addCartItemInput: $input) {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          images
          description
          stock
        }
      }
      total
      itemCount
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($itemId: ID!) {
    removeFromCart(id: $itemId) {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          images
          description
          stock
        }
      }
      total
      itemCount
    }
  }
`;

const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(updateCartItemInput: $input) {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          images
          description
          stock
        }
      }
      total
      itemCount
    }
  }
`;

export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
    stock: number;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export function useCart() {
  const { data, loading, error } = useQuery<{ cart: Cart }>(GET_CART);
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART);
  const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await addToCartMutation({
        variables: {
          input: {
            productId,
            quantity,
          },
        },
        update: (cache, { data }) => {
          cache.writeQuery({
            query: GET_CART,
            data: { cart: data.addToCart },
          });
        },
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await removeFromCartMutation({
        variables: { itemId },
        update: (cache, { data }) => {
          cache.writeQuery({
            query: GET_CART,
            data: { cart: data.removeFromCart },
          });
        },
      });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw error;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      await updateCartItemMutation({
        variables: {
          input: {
            cartItemId: itemId,
            quantity,
          },
        },
        update: (cache, { data }) => {
          cache.writeQuery({
            query: GET_CART,
            data: { cart: data.updateCartItem },
          });
        },
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  };

  return {
    cart: data?.cart,
    cartItemsCount: data?.cart?.itemCount || 0,
    cartTotal: data?.cart?.total || 0,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
  };
}
