import { graphqlRequest } from "@/lib/graphql/client";
import type { Study } from "@/lib/graphql/studies";

export type ResponseOption = {
  option_id: number;
  label: string;
  numeric_value: number | null;
};

export type QuestionDetail = {
  item_name: string;
  item_text: string | null;
  item_language: string;
  reverse_coded: boolean | null;
  data_type: string | null;
  scale_name: string | null;
  scale_type: string | null;
  response_options: ResponseOption[];
  instrument_name: string | null;
  instrument_citation: string | null;
  instrument_intro_en: string | null;
  instrument_intro_de: string | null;
  studies: Study[];
};

type GetQuestionDetailsResponse = {
  questionDetails: QuestionDetail[];
};

const GET_QUESTION_DETAILS_QUERY = `
  query GetQuestionDetails($item_names: [String!]!, $language: String) {
    questionDetails(item_names: $item_names, language: $language) {
      item_name
      item_text
      item_language
      reverse_coded
      data_type
      scale_name
      scale_type
      response_options {
        option_id
        label
        numeric_value
      }
      instrument_name
      instrument_citation
      instrument_intro_en
      instrument_intro_de
      studies {
        study_name
        title
        doi
        publication_year
        citation
        journal
      }
    }
  }
`;

export async function getQuestionDetails(
  itemNames: string[],
  language: string = "en",
): Promise<QuestionDetail[]> {
  const data = await graphqlRequest<
    GetQuestionDetailsResponse,
    { item_names: string[]; language: string }
  >(GET_QUESTION_DETAILS_QUERY, { item_names: itemNames, language });
  return data.questionDetails;
}
