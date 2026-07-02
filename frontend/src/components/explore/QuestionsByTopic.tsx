import type { TopicGroup } from "@/lib/graphql/studies";
import { FormattedItemText } from "@/lib/formatItemText";
import { Image } from "@/components/Image";
import Link from "next/link";

type Props = {
  topics: TopicGroup[];
  headline?: string;
  expanded?: boolean;
  selectedQuestionIds?: string[];
  compact?: boolean;
  openQuestionsInNewTab?: boolean;
};

export default function QuestionsByTopic({
  topics,
  headline,
  expanded,
  selectedQuestionIds = [],
  compact = false,
  openQuestionsInNewTab = false,
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
      ? selectedQuestionIds.filter((id) => id !== itemName)
      : [...selectedQuestionIds, itemName];

    return `/explore-dataset/questions?ids=${nextSelectedQuestionIds.join(",")}`;
  }

  function getSelectAllHref(questionIds: string[]) {
    const merged = Array.from(
      new Set([...selectedQuestionIds, ...questionIds]),
    );
    return `/explore-dataset/questions?ids=${merged.join(",")}`;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h2
        className={compact ? "font-medium text-lg" : "font-semibold text-3xl"}
      >
        {headline ?? "Questions by Topic"}
      </h2>
      <div className="gap-10 w-full sm:max-w-[80%]">
        {topics.map((topic) => (
          <details
            key={topic.topic_name}
            name={expanded ? undefined : "topics"}
            open={expanded}
            className="break-inside-avoid border-b border-lmp-gray3 py-2 mb-3"
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
                        <ul className="pl-4 mt-1 flex flex-col gap-1 list-none items-start">
                          {subfacet.questions.map((q) => {
                            const isSelected = selectedQuestionIds.includes(
                              q.item_name,
                            );
                            return (
                              <Link
                                key={`${q.item_name}-${q.item_language}`}
                                href={getQuestionHref(q.item_name)}
                                scroll={false}
                                target={openQuestionsInNewTab ? "_blank" : undefined}
                                rel={openQuestionsInNewTab ? "noopener noreferrer" : undefined}
                                className={`text-sm rounded-xl px-3 py-2 transition flex items-start gap-2 ${
                                  isSelected
                                    ? "bg-lmp-gray3 hover:bg-lmp-gray3/70"
                                    : "bg-lmp-gray3 hover:bg-lmp-gray3/70"
                                }`}
                              >
                                {isSelected && (
                                  <Image
                                    src="/assets/x_circle.svg"
                                    alt="Deselect"
                                    width={16}
                                    height={16}
                                    className="shrink-0 mt-0.5"
                                  />
                                )}
                                <span>
                                  <span className="text-xs mr-2">
                                    [{q.item_name}]
                                  </span>
                                  {q.instruction_id === "SF_12" ? (
                                    "[SF12v2 copyright]"
                                  ) : (
                                    <FormattedItemText
                                      text={q.item_text ?? "—"}
                                    />
                                  )}
                                </span>
                              </Link>
                            );
                          })}
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
                          <Link
                            href={getSelectAllHref(
                              subfacet.questions.map((q) => q.item_name),
                            )}
                            scroll={false}
                            className="text-sm ml-4 underline hover:text-lmp-text/70 transition"
                          >
                            Select All
                          </Link>
                          {questions}
                        </details>
                      ) : (
                        <div key={si}>
                          <Link
                            href={getSelectAllHref(
                              subfacet.questions.map((q) => q.item_name),
                            )}
                            scroll={false}
                            className="text-sm ml-4 underline hover:text-lmp-text/70 transition"
                          >
                            Select All
                          </Link>
                          <div>{questions}</div>
                        </div>
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
