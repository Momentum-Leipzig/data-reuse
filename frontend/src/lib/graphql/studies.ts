import { graphqlRequest } from "@/lib/graphql/client";

export type Study = {
  study_name: string;
  title: string | null;
  doi: string | null;
  publication_year: number | null;
  citation: string | null;
  journal: string | null;
};

export type Question = {
  item_name: string;
  item_language: string;
  item_text: string | null;
  reverse_coded: boolean | null;
  data_type: string | null;
};

export type SubfacetGroup = {
  subfacet_name: string | null;
  description: string | null;
  questions: Question[];
};

export type ConstructGroup = {
  construct_name: string;
  description: string | null;
  subfacets: SubfacetGroup[];
};

export type TopicGroup = {
  topic_name: string;
  description: string | null;
  constructs: ConstructGroup[];
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

type GetStudyQuestionsResponse = {
  studyQuestions: TopicGroup[];
};

const GET_STUDY_QUESTIONS_QUERY = `
  query GetStudyQuestions($study_name: String!) {
    studyQuestions(study_name: $study_name) {
      topic_name
      description
      constructs {
        construct_name
        description
        subfacets {
          subfacet_name
          description
          questions {
            item_name
            item_language
            item_text
            reverse_coded
            data_type
          }
        }
      }
    }
  }
`;

export async function getStudyQuestions(
  studyName: string,
): Promise<TopicGroup[]> {
  const data = await graphqlRequest<
    GetStudyQuestionsResponse,
    { study_name: string }
  >(GET_STUDY_QUESTIONS_QUERY, { study_name: studyName });
  return data.studyQuestions;
}

type GetAllQuestionsResponse = {
  allQuestions: TopicGroup[];
};

const GET_ALL_QUESTIONS_QUERY = `
  query GetAllQuestions {
    allQuestions {
      topic_name
      description
      constructs {
        construct_name
        description
        subfacets {
          subfacet_name
          description
          questions {
            item_name
            item_language
            item_text
            reverse_coded
            data_type
          }
        }
      }
    }
  }
`;

export async function getAllQuestions(): Promise<TopicGroup[]> {
  const data = await graphqlRequest<GetAllQuestionsResponse>(
    GET_ALL_QUESTIONS_QUERY,
  );
  return data.allQuestions;
}
