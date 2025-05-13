import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

interface Store {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  ownerId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StoreFilter {
  ownerId?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING";
  search?: string;
}

const GET_STORES = gql`
  query GetStores($filter: StoreFilterInput) {
    stores(filter: $filter) {
      _id
      name
      description
      logo
      banner
      ownerId
      address {
        street
        city
        state
        zipCode
      }
      contact {
        email
        phone
      }
      status
      rating
      createdAt
      updatedAt
    }
  }
`;

const GET_STORE = gql`
  query GetStore($id: ID!) {
    store(id: $id) {
      _id
      name
      description
      logo
      banner
      ownerId
      address {
        street
        city
        state
        zipCode
      }
      contact {
        email
        phone
      }
      status
      rating
      createdAt
      updatedAt
    }
  }
`;

const CREATE_STORE = gql`
  mutation CreateStore($input: CreateStoreInput!) {
    createStore(input: $input) {
      _id
      name
      description
      logo
      banner
      ownerId
      address {
        street
        city
        state
        zipCode
      }
      contact {
        email
        phone
      }
      status
      rating
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_STORE = gql`
  mutation UpdateStore($id: ID!, $input: UpdateStoreInput!) {
    updateStore(id: $id, input: $input) {
      _id
      name
      description
      logo
      banner
      status
      updatedAt
    }
  }
`;

const DELETE_STORE = gql`
  mutation DeleteStore($id: ID!) {
    deleteStore(id: $id) {
      _id
      success
    }
  }
`;

export function useStores(filter?: StoreFilter) {
  const { data, loading, error } = useQuery(GET_STORES, {
    variables: { filter },
  });

  return {
    stores: data?.stores as Store[],
    loading,
    error,
  };
}

export function useStore(id: string) {
  const { data, loading, error } = useQuery(GET_STORE, {
    variables: { id },
  });

  return {
    store: data?.store as Store,
    loading,
    error,
  };
}

export function useStoreMutations() {
  const [createStoreMutation] = useMutation(CREATE_STORE);
  const [updateStoreMutation] = useMutation(UPDATE_STORE);
  const [deleteStoreMutation] = useMutation(DELETE_STORE);

  const createStore = async (input: {
    name: string;
    description: string;
    logo?: string;
    banner?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    contact: {
      email: string;
      phone: string;
    };
  }) => {
    const { data } = await createStoreMutation({
      variables: { input },
      refetchQueries: [{ query: GET_STORES }],
    });
    return data.createStore;
  };

  const updateStore = async (
    id: string,
    input: {
      name?: string;
      description?: string;
      logo?: string;
      banner?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
      };
      contact?: {
        email?: string;
        phone?: string;
      };
      status?: "ACTIVE" | "INACTIVE" | "PENDING";
    }
  ) => {
    const { data } = await updateStoreMutation({
      variables: { id, input },
      refetchQueries: [{ query: GET_STORES }],
    });
    return data.updateStore;
  };

  const deleteStore = async (id: string) => {
    const { data } = await deleteStoreMutation({
      variables: { id },
      refetchQueries: [{ query: GET_STORES }],
    });
    return data.deleteStore;
  };

  return {
    createStore,
    updateStore,
    deleteStore,
  };
}
