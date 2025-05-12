import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "YOUR_GRAPHQL_ENDPOINT",
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/gql/": {
      preset: "client",
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
      },
    },
  },
};

export default config;
