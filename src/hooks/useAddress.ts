import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  apartment?: string;
  userId: string;
  isDefault: boolean;
  label?: string;
}

interface AddressFilter {
  isDefault?: boolean;
  userId?: string;
}

const GET_ADDRESSES = gql`
  query GetAddresses($filter: AddressFilterInput) {
    addresses(filter: $filter) {
      _id
      street
      city
      state
      zipCode
      apartment
      userId
      isDefault
      label
    }
  }
`;

const GET_ADDRESS = gql`
  query GetAddress($id: ID!) {
    address(id: $id) {
      _id
      street
      city
      state
      zipCode
      apartment
      userId
      isDefault
      label
    }
  }
`;

const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      _id
      street
      city
      state
      zipCode
      apartment
      userId
      isDefault
      label
    }
  }
`;

const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $input: UpdateAddressInput!) {
    updateAddress(id: $id, input: $input) {
      _id
      street
      city
      state
      zipCode
      apartment
      userId
      isDefault
      label
    }
  }
`;

const DELETE_ADDRESS = gql`
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id) {
      _id
      success
    }
  }
`;

const SET_DEFAULT_ADDRESS = gql`
  mutation SetDefaultAddress($id: ID!) {
    setDefaultAddress(id: $id) {
      _id
      isDefault
    }
  }
`;

export function useAddresses(filter?: AddressFilter) {
  const { data, loading, error } = useQuery(GET_ADDRESSES, {
    variables: { filter },
  });

  return {
    addresses: data?.addresses as Address[],
    loading,
    error,
  };
}

export function useAddress(id: string) {
  const { data, loading, error } = useQuery(GET_ADDRESS, {
    variables: { id },
  });

  return {
    address: data?.address as Address,
    loading,
    error,
  };
}

export function useAddressMutations() {
  const [createAddressMutation] = useMutation(CREATE_ADDRESS);
  const [updateAddressMutation] = useMutation(UPDATE_ADDRESS);
  const [deleteAddressMutation] = useMutation(DELETE_ADDRESS);
  const [setDefaultAddressMutation] = useMutation(SET_DEFAULT_ADDRESS);

  const createAddress = async (input: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    apartment?: string;
    isDefault?: boolean;
    label?: string;
  }) => {
    const { data } = await createAddressMutation({
      variables: { input },
    });
    return data.createAddress;
  };

  const updateAddress = async (
    id: string,
    input: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      apartment?: string;
      isDefault?: boolean;
      label?: string;
    }
  ) => {
    const { data } = await updateAddressMutation({
      variables: { id, input },
    });
    return data.updateAddress;
  };

  const deleteAddress = async (id: string) => {
    const { data } = await deleteAddressMutation({
      variables: { id },
    });
    return data.deleteAddress;
  };

  const setDefaultAddress = async (id: string) => {
    const { data } = await setDefaultAddressMutation({
      variables: { id },
    });
    return data.setDefaultAddress;
  };

  return {
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
