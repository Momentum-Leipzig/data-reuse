"use client";

import MetricsOverview from "@/components/explore/MetricsOverview";
import QuestionDetailCard from "@/components/explore/QuestionDetailCard";
import QuestionsByTopic from "@/components/explore/QuestionsByTopic";
import SelectedEntity from "@/components/explore/SelectedEntity";
import WaveParticipantsChart from "@/components/explore/WaveParticipantsChart";
import SearchPreview from "@/components/search/SearchPreview";
import {
  getAllQuestions,
  type Question,
  type TopicGroup,
} from "@/lib/graphql/studies";
import {
  getQuestionDetails,
  type QuestionDetail,
} from "@/lib/graphql/questions";
import {
  getGlobalMetrics,
  getMetricsByQuestions,
  getMetricsByQuestionsAnd,
  type Metrics,
} from "@/lib/graphql/metrics";
import {
  getGlobalWaveParticipants,
  getWaveParticipantsByQuestions,
  getWaveParticipantsByQuestionsAnd,
  type WaveParticipants,
} from "@/lib/graphql/waves";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type ContextMap = Map<
  string,
  {
    topic_name: string | null;
    construct_name: string | null;
    subfacet_name: string | null;
  }
>;

function groupQuestionDetails(
  details: QuestionDetail[],
  contextMap: ContextMap,
): QuestionDetail[][] {
  const groups: QuestionDetail[][] = [];
  const keyToGroupIndex = new Map<string, number>();

  for (const qd of details) {
    const ctx = contextMap.get(qd.item_name);
    const subfacet = ctx?.subfacet_name ?? null;

    const construct = ctx?.construct_name ?? null;

    let key: string;
    if (!subfacet && !construct) {
      key = `solo::${qd.item_name}`;
    } else {
      const studyKey = [...qd.studies]
        .map((s) => s.study_name)
        .sort()
        .join("|");
      const groupLevel = subfacet ?? construct;
      key = `${groupLevel}::${qd.scale_name ?? ""}::${qd.instrument_name ?? ""}::${studyKey}`;
    }

    const existing = keyToGroupIndex.get(key);
    if (existing !== undefined) {
      groups[existing].push(qd);
    } else {
      keyToGroupIndex.set(key, groups.length);
      groups.push([qd]);
    }
  }

  return groups;
}

function QuestionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") ?? undefined;
  const selectedIds = useMemo(
    () =>
      ids
        ? ids
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
    [ids],
  );
  const mode = selectedIds.length > 0 ? "selected" : "all";

  const [topics, setTopics] = useState<TopicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [logic, setLogic] = useState<"or" | "and">("or");
  const [language, setLanguage] = useState<"en" | "de">("en");
  const [questionDetails, setQuestionDetails] = useState<QuestionDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [waveData, setWaveData] = useState<WaveParticipants[] | null>(null);
  const [globalWaveData, setGlobalWaveData] = useState<
    WaveParticipants[] | undefined
  >(undefined);

  const allQuestions = useMemo(() => {
    return topics.flatMap((topic) =>
      topic.constructs.flatMap((construct) =>
        construct.subfacets.flatMap((subfacet) => subfacet.questions),
      ),
    );
  }, [topics]);

  const questionsWithContext = useMemo(() => {
    return topics.flatMap((topic) =>
      topic.constructs.flatMap((construct) =>
        construct.subfacets.flatMap((subfacet) =>
          subfacet.questions.map((q) => ({
            ...q,
            topic_name: topic.topic_name,
            construct_name: construct.construct_name,
            subfacet_name: subfacet.subfacet_name,
          })),
        ),
      ),
    );
  }, [topics]);

  const questionsById = useMemo(() => {
    return new Map(allQuestions.map((q) => [q.item_name, q]));
  }, [allQuestions]);

  const contextByItemName = useMemo(() => {
    return new Map(
      questionsWithContext.map((q) => [
        q.item_name,
        {
          topic_name: q.topic_name,
          construct_name: q.construct_name,
          subfacet_name: q.subfacet_name ?? null,
        },
      ]),
    );
  }, [questionsWithContext]);

  const selectedQuestions = useMemo(() => {
    return selectedIds
      .map((id) => questionsById.get(id))
      .filter((q): q is Question => Boolean(q));
  }, [selectedIds, questionsById]);

  // Fetch global wave data once — used to keep the Y axis stable when filtering.
  useEffect(() => {
    getGlobalWaveParticipants().then(setGlobalWaveData);
  }, []);

  // Re-fetch metrics and wave data whenever the selection or logic mode changes.
  useEffect(() => {
    if (selectedIds.length === 0) {
      // Selection cleared — restore global data (already cached).
      getGlobalMetrics().then(setMetrics);
      getGlobalWaveParticipants().then(setWaveData);
      return;
    }
    setMetrics(null);
    setWaveData(null);
    const fetchMetrics =
      logic === "and" && selectedIds.length > 1
        ? getMetricsByQuestionsAnd
        : getMetricsByQuestions;
    const fetchWaves =
      logic === "and" && selectedIds.length > 1
        ? getWaveParticipantsByQuestionsAnd
        : getWaveParticipantsByQuestions;
    fetchMetrics(selectedIds).then((fetched) => {
      setMetrics({ ...fetched, questions: selectedIds.length });
    });
    fetchWaves(selectedIds).then(setWaveData);
  }, [selectedIds, logic]);

  function selectQuestion(itemName: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    const nextSelectedIds = selectedIds.includes(itemName)
      ? selectedIds
      : [...selectedIds, itemName];
    nextSearchParams.set("ids", nextSelectedIds.join(","));
    const nextQueryString = nextSearchParams.toString();
    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
    );
  }

  function deselectQuestion(itemName: string) {
    const nextSelectedIds = selectedIds.filter((id) => id !== itemName);
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextSelectedIds.length > 0) {
      nextSearchParams.set("ids", nextSelectedIds.join(","));
    } else {
      nextSearchParams.delete("ids");
      setLogic("or");
    }

    const nextQueryString = nextSearchParams.toString();
    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
    );
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const result = await getAllQuestions();
        if (active) {
          setTopics(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setQuestionDetails([]);
      return;
    }

    let active = true;

    async function loadDetails() {
      try {
        setDetailsLoading(true);
        const result = await getQuestionDetails(selectedIds, language);
        if (active) {
          setQuestionDetails(result);
        }
      } finally {
        if (active) setDetailsLoading(false);
      }
    }

    loadDetails();
    return () => {
      active = false;
    };
  }, [selectedIds, language]);

  {
    /* all questions section */
  }
  const allQuestionsBlock = (
    <div>
      {loading && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-3xl">
            All Questions by Topic, Construct, and Subfacet
          </h2>
          <p>Loading questions…</p>
        </div>
      )}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && !error && (
        <QuestionsByTopic
          topics={topics}
          headline="All Questions by Topic, Construct, and Subfacet"
          selectedQuestionIds={selectedIds}
        />
      )}
    </div>
  );

  return (
    <section className="flex flex-col gap-15">
      <SearchPreview
        items={questionsWithContext}
        loading={loading}
        error={error}
        placeholder="Search by keyword or question ID"
        getItemKey={(q) => `${q.item_name}-${q.item_language}`}
        getSearchFields={(q) => [
          q.item_name,
          q.item_text,
          q.item_language,
          q.topic_name,
          q.construct_name,
          q.subfacet_name,
        ]}
        onSelect={(q) => selectQuestion(q.item_name)}
        renderItem={(q) => (
          <div className="flex flex-col gap-0.5 text-sm">
            <p className="text-xs text-gray-600">
              {q.topic_name}
              {q.construct_name ? ` › ${q.construct_name}` : ""}
              {q.subfacet_name ? ` › ${q.subfacet_name}` : ""}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-xs text-gray-600">
                [{q.item_name}]
              </span>
              <span className="font-medium">{q.item_text ?? "No text"}</span>
            </div>
          </div>
        )}
      />

      {mode === "all" ? (
        <div className="flex flex-col gap-15">
          <MetricsOverview metrics={metrics} />

          <WaveParticipantsChart data={waveData} globalData={globalWaveData} />

          {allQuestionsBlock}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Selection  */}
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center gap-6 flex-wrap">
              <p className="font-bold">Selection</p>
              {selectedIds.length > 1 && (
                <div className="flex rounded-lg border border-lmp-text overflow-hidden text-sm">
                  <button
                    onClick={() => setLogic("or")}
                    title="OR – count participants who answered at least one of the selected questions"
                    className={`px-4 py-1.5 transition cursor-pointer ${logic === "or" ? "bg-lmp-text text-white" : "hover:bg-lmp-gray3"}`}
                  >
                    OR
                  </button>
                  <button
                    onClick={() => setLogic("and")}
                    title="AND – count participants who answered all of the selected questions"
                    className={`px-4 py-1.5 transition cursor-pointer ${logic === "and" ? "bg-lmp-text text-white" : "hover:bg-lmp-gray3"}`}
                  >
                    AND
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {selectedQuestions.map((question) => (
                <SelectedEntity
                  key={question.item_name}
                  deselect={() => deselectQuestion(question.item_name)}
                >
                  <p>
                    [{question.item_name}]
                    <span className="font-bold ml-2">
                      {question.instruction_id === "SF_12"
                        ? "[SF12v2 copyright]"
                        : (question.item_text ?? "—")}
                    </span>
                  </p>
                </SelectedEntity>
              ))}

              {!loading && !error && selectedQuestions.length === 0 && (
                <p>No selected question details found.</p>
              )}
            </div>
          </div>

          <MetricsOverview metrics={metrics} />

          <WaveParticipantsChart
            data={waveData}
            globalData={globalWaveData}
            hasActiveFilter={selectedIds.length > 0}
            headline={`Participants per Measurement Points that Answered ${
              selectedIds.length > 1
                ? logic === "and"
                  ? "All of the Selected Questions"
                  : "Any of the Selected Questions"
                : "the Selected Question"
            }`}
          />

          {/* Details on the selected questions */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-semibold text-3xl">
                Details on the Selected Question
                {selectedIds.length > 1 ? "s" : ""}
              </h2>
              <div className="flex rounded-lg border border-lmp-text overflow-hidden text-sm">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-1.5 transition cursor-pointer ${language === "en" ? "bg-lmp-text text-white" : "hover:bg-lmp-gray3"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("de")}
                  className={`px-4 py-1.5 transition cursor-pointer ${language === "de" ? "bg-lmp-text text-white" : "hover:bg-lmp-gray3"}`}
                >
                  DE
                </button>
              </div>
            </div>
            <div
              className={
                detailsLoading
                  ? "flex flex-col gap-4 opacity-50 pointer-events-none"
                  : "flex flex-col gap-4"
              }
            >
              {groupQuestionDetails(questionDetails, contextByItemName).map(
                (group) => (
                  <QuestionDetailCard
                    key={group.map((qd) => qd.item_name).join(",")}
                    questions={group}
                    context={contextByItemName.get(group[0].item_name)}
                    onDeselect={deselectQuestion}
                  />
                ),
              )}
            </div>
          </div>

          {/* all questions section */}
          {allQuestionsBlock}
        </div>
      )}
    </section>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <section>
          <p>Loading…</p>
        </section>
      }
    >
      <QuestionsContent />
    </Suspense>
  );
}
