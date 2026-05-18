import type { TopicGroup } from "@/lib/graphql/studies";
import Link from "next/link";

type Props = {
  topics: TopicGroup[];
  headline?: string;
  expanded?: boolean;
  selectedQuestionIds?: string[];
  compact?: boolean;
};

export default function QuestionsByTopic({
  topics,
  headline,
  expanded,
  selectedQuestionIds = [],
  compact = false,
}: Props) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2
          className={compact ? "font-medium text-lg" : "font-semibold text-3xl"}
        >
          {headline ?? "Questions by Topic"}
        </h2>
        <p className="text-sm text-gray-500">No questions found.</p>
      </div>
    );
  }

  function getQuestionHref(itemName: string) {
    const nextSelectedQuestionIds = selectedQuestionIds.includes(itemName)
      ? selectedQuestionIds
      : [...selectedQuestionIds, itemName];

    return `/explore-dataset/questions?ids=${nextSelectedQuestionIds.join(",")}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2
        className={compact ? "font-medium text-lg" : "font-semibold text-3xl"}
      >
        {headline ?? "Questions by Topic"}
      </h2>
      <div className="columns-2 gap-10 w-full">
        {topics.map((topic) => (
          <details
            key={topic.topic_name}
            name={expanded ? undefined : "topics"}
            open={expanded}
            className="break-inside-avoid border-t border-lmp-gray3 pt-2 mb-3"
          >
            <summary className="cursor-pointer">
              <span
                className={
                  compact ? "font-medium text-lg" : "font-medium text-xl"
                }
              >
                {topic.topic_name}
              </span>{" "}
              <br />
              <span className="ml-4 block">{topic.description}</span>
            </summary>
            <div className="pl-4 mt-1 flex flex-col gap-2">
              {topic.constructs.map((construct) => (
                <details
                  key={construct.construct_name}
                  name={expanded ? undefined : "constructs"}
                  open={expanded}
                  className="break-inside-avoid"
                >
                  <summary className="cursor-pointer">
                    <span className="font-medium text-base">
                      {construct.construct_name}
                    </span>
                    <br />
                    <span className="text-sm ml-4 block">
                      {construct.description}
                    </span>
                  </summary>
                  <div className="pl-8 mt-1 flex flex-col gap-2">
                    {construct.subfacets.map((subfacet, si) => {
                      const questions = (
                        <ul className="pl-4 mt-1 flex flex-col gap-1 list-none">
                          {subfacet.questions.map((q) => (
                            <Link
                              key={`${q.item_name}-${q.item_language}`}
                              href={getQuestionHref(q.item_name)}
                              className="text-sm bg-lmp-gray3 hover:bg-lmp-gray3/70 rounded-xl px-3 py-2 transition"
                            >
                              <span className="font-mono text-xs text-gray-500 mr-2">
                                [{q.item_name}]
                              </span>
                              {q.item_text ?? "—"}
                            </Link>
                          ))}
                        </ul>
                      );

                      return subfacet.subfacet_name ? (
                        <details
                          key={subfacet.subfacet_name}
                          name={expanded ? undefined : "subfacets"}
                          open={expanded}
                          className="break-inside-avoid"
                        >
                          <summary className="cursor-pointer text-sm">
                            <span className="font-medium">
                              {subfacet.subfacet_name}
                            </span>
                            <br />
                            <span className="text-sm ml-4 block">
                              {subfacet.description}
                            </span>
                          </summary>
                          {questions}
                        </details>
                      ) : (
                        <div key={si}>{questions}</div>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
