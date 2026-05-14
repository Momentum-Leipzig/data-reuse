import { graphqlRequest } from "@/lib/graphql/client";

export type WaveParticipants = {
  wave: string;
  month: string;
  participants: number;
};

// ---------------------------------------------------------------------------
// GraphQL queries
// ---------------------------------------------------------------------------

const WAVE_FIELDS = `
  wave
  month
  participants
`;

const WAVE_PARTICIPANTS_QUERY = `
  query WaveParticipants {
    waveParticipants {
      ${WAVE_FIELDS}
    }
  }
`;

const WAVE_PARTICIPANTS_BY_STUDIES_QUERY = `
  query WaveParticipantsByStudies($study_names: [String!]!) {
    waveParticipantsByStudies(study_names: $study_names) {
      ${WAVE_FIELDS}
    }
  }
`;

const WAVE_PARTICIPANTS_BY_QUESTIONS_QUERY = `
  query WaveParticipantsByQuestions($item_names: [String!]!) {
    waveParticipantsByQuestions(item_names: $item_names) {
      ${WAVE_FIELDS}
    }
  }
`;

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

let _globalWaveCache: Promise<WaveParticipants[]> | null = null;

export function getGlobalWaveParticipants(): Promise<WaveParticipants[]> {
  if (!_globalWaveCache) {
    _globalWaveCache = graphqlRequest<{
      waveParticipants: WaveParticipants[];
    }>(WAVE_PARTICIPANTS_QUERY).then((data) => data.waveParticipants);
  }
  return _globalWaveCache;
}

export async function getWaveParticipantsByStudies(
  studyNames: string[],
): Promise<WaveParticipants[]> {
  const data = await graphqlRequest<
    { waveParticipantsByStudies: WaveParticipants[] },
    { study_names: string[] }
  >(WAVE_PARTICIPANTS_BY_STUDIES_QUERY, { study_names: studyNames });
  return data.waveParticipantsByStudies;
}

export async function getWaveParticipantsByQuestions(
  itemNames: string[],
): Promise<WaveParticipants[]> {
  const data = await graphqlRequest<
    { waveParticipantsByQuestions: WaveParticipants[] },
    { item_names: string[] }
  >(WAVE_PARTICIPANTS_BY_QUESTIONS_QUERY, { item_names: itemNames });
  return data.waveParticipantsByQuestions;
}
