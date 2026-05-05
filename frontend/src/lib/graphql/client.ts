type GraphQLError = {
  message: string;
};

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: GraphQLError[];
};

export async function graphqlRequest<
  TData,
  TVariables = Record<string, unknown>,
>(query: string, variables?: TVariables): Promise<TData> {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL;

  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_GRAPHQL_URL is not set.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors.map((error) => error.message).join("; ");
    throw new Error(`GraphQL error: ${message}`);
  }

  if (!payload.data) {
    throw new Error("GraphQL response missing data.");
  }

  return payload.data;
}
