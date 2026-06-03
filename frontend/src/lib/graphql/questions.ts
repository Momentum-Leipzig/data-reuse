import { graphqlRequest } from "@/lib/graphql/client";
import type { Study } from "@/lib/graphql/studies";

export type ResponseOption = {
  option_id: number;
  label: string | null;
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
  instrument_translation: string | null;
  instrument_comment: string | null;
  instrument_intro: string | null;
  instruction_id: string | null;
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
      instrument_translation
      instrument_comment
      instrument_intro
      instruction_id
      studies {
        study_name
        title
        doi
        publication_year
        citation
        journal
        comment
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
