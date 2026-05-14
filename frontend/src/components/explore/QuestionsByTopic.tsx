import type { TopicGroup } from "@/lib/graphql/studies";

type Props = {
  topics: TopicGroup[];
  headline?: string;
};

export default function QuestionsByTopic({ topics, headline }: Props) {
  if (topics.length === 0) {
    return <p className="text-sm text-gray-500">No questions found.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-3xl">{headline ?? "Questions by Topic"}</h2>
      <div>
        {topics.map((topic) => (
          <details key={topic.topic_name} className="mb-2">
            <summary className="cursor-pointer font-medium">
              {topic.topic_name}
            </summary>
            <div className="pl-4 mt-1 space-y-2">
              {topic.constructs.map((construct) => (
                <details key={construct.construct_name}>
                  <summary className="cursor-pointer">
                    {construct.construct_name}
                  </summary>
                  <div className="pl-4 mt-1 space-y-2">
                    {construct.subfacets.map((subfacet, si) => {
                      const questions = (
                        <ul className="pl-4 mt-1 space-y-1">
                          {subfacet.questions.map((q) => (
                            <li
                              key={`${q.item_name}-${q.item_language}`}
                              className="text-sm"
                            >
                              <span className="font-mono text-xs text-gray-500 mr-2">
                                [{q.item_name}]
                              </span>
                              {q.item_text ?? "—"}
                              {q.reverse_coded && (
                                <span className="ml-1 text-xs text-gray-400">
                                  (R)
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      );

                      return subfacet.subfacet_name ? (
                        <details key={subfacet.subfacet_name}>
                          <summary className="cursor-pointer text-sm">
                            {subfacet.subfacet_name}
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
