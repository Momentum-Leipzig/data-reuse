import { graphqlRequest } from "@/lib/graphql/client";

export type Metrics = {
  questions: number;
  participants: number;
  measurementPoints: number;
  dataPoints: number;
};

// ---------------------------------------------------------------------------
// GraphQL queries
// ---------------------------------------------------------------------------

const METRICS_FIELDS = `
  questions
  participants
  measurementPoints
  dataPoints
`;

const GLOBAL_METRICS_QUERY = `
  query GlobalMetrics {
    globalMetrics {
      ${METRICS_FIELDS}
    }
  }
`;

const METRICS_BY_STUDIES_QUERY = `
  query MetricsByStudies($study_names: [String!]!) {
    metricsByStudies(study_names: $study_names) {
      ${METRICS_FIELDS}
    }
  }
`;

const METRICS_BY_QUESTIONS_QUERY = `
  query MetricsByQuestions($item_names: [String!]!) {
    metricsByQuestions(item_names: $item_names) {
      ${METRICS_FIELDS}
    }
  }
`;

const METRICS_BY_WAVES_QUERY = `
  query MetricsByWaves($wave_names: [String!]!) {
    metricsByWaves(wave_names: $wave_names) {
      ${METRICS_FIELDS}
    }
  }
`;

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

/** Module-level cache — fetched once per browser session (data rarely changes). */
let _globalMetricsCache: Promise<Metrics> | null = null;

export function getGlobalMetrics(): Promise<Metrics> {
  if (!_globalMetricsCache) {
    _globalMetricsCache = graphqlRequest<{ globalMetrics: Metrics }>(
      GLOBAL_METRICS_QUERY,
    ).then((data) => data.globalMetrics);
  }
  return _globalMetricsCache;
}

export async function getMetricsByStudies(
  studyNames: string[],
): Promise<Metrics> {
  const data = await graphqlRequest<
    { metricsByStudies: Metrics },
    { study_names: string[] }
  >(METRICS_BY_STUDIES_QUERY, { study_names: studyNames });
  return data.metricsByStudies;
}

export async function getMetricsByQuestions(
  itemNames: string[],
): Promise<Metrics> {
  const data = await graphqlRequest<
    { metricsByQuestions: Metrics },
    { item_names: string[] }
  >(METRICS_BY_QUESTIONS_QUERY, { item_names: itemNames });
  return data.metricsByQuestions;
}

export async function getMetricsByWaves(waveNames: string[]): Promise<Metrics> {
  const data = await graphqlRequest<
    { metricsByWaves: Metrics },
    { wave_names: string[] }
  >(METRICS_BY_WAVES_QUERY, { wave_names: waveNames });
  return data.metricsByWaves;
}
