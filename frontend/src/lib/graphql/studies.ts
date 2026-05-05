import { graphqlRequest } from "@/lib/graphql/client";

export type Study = {
  study_name: string;
  title: string | null;
  doi: string | null;
  publication_year: number | null;
  citation: string | null;
  journal: string | null;
};

type GetStudiesResponse = {
  studies: Study[];
};

const GET_STUDIES_QUERY = `
  query GetStudies {
    studies {
      study_name
      title
      doi
      publication_year
      citation
      journal
    }
  }
`;

export async function getStudies(): Promise<Study[]> {
  const data = await graphqlRequest<GetStudiesResponse>(GET_STUDIES_QUERY);
  return data.studies;
}
