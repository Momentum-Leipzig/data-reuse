import { Image } from "@/components/Image";
import QuestionsByTopic from "@/components/explore/QuestionsByTopic";
import type { Study, TopicGroup } from "@/lib/graphql/studies";

type Props = {
  study: Study;
  onDeselect: () => void;
  topics?: TopicGroup[];
  topicsLoading?: boolean;
  topicsError?: string | null;
};

export default function StudyDetailCard({
  study,
  onDeselect,
  topics,
  topicsLoading,
  topicsError,
}: Props) {
  return (
    <div className="flex flex-col items-start gap-4 border border-lmp-text rounded-2xl p-6">
      {/* Study name — styled like SelectedEntity, with deselect */}
      <div
        className="rounded-2xl p-3 bg-lmp-gray3 flex flex-wrap gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm"
        onClick={onDeselect}
      >
        <Image
          src="/assets/x_circle.svg"
          alt="Deselect"
          width={20}
          height={20}
          className="mr-2 shrink-0"
        />
        <p>{study.study_name.split("20")[0].trim()}</p>●
        <p>{study.publication_year ?? "No publication year"}</p>●
        <p className="font-bold">{study.title ?? "No title"}</p>●
        <p>{study.doi ?? "No DOI"}</p>
      </div>

      {/* Full title */}
      {study.title && (
        <p className="text-2xl font-semibold">&quot;{study.title}&quot;</p>
      )}

      {/* Metadata grid */}
      <div className="w-full grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm min-w-0">
        {study.publication_year && (
          <>
            <p className="font-medium text-lg">Year</p>
            <p className="text-lg min-w-0 break-words">
              {study.publication_year}
            </p>
          </>
        )}
        {study.journal && (
          <>
            <p className="font-medium text-lg">Journal</p>
            <p className="text-lg min-w-0 break-words">{study.journal}</p>
          </>
        )}
        {study.doi && (
          <>
            <p className="font-medium text-lg">DOI</p>
            <p className="text-lg min-w-0 break-all">
              <a
                href={`https://doi.org/${study.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600"
              >
                {study.doi}
              </a>
            </p>
          </>
        )}
        {study.citation && (
          <>
            <p className="font-medium text-lg">Citation</p>
            <p className="text-lg min-w-0 break-words">{study.citation}</p>
          </>
        )}
      </div>

      {/* Comment */}
      {study.comment && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Comment</p>
          <p className="text-sm text-gray-600 italic">{study.comment}</p>
        </div>
      )}

      {/* Included questions */}
      {topicsLoading && (
        <p className="text-sm text-gray-500">Loading questions…</p>
      )}
      {topicsError && (
        <p className="text-sm text-red-600">Error: {topicsError}</p>
      )}
      {!topicsLoading && !topicsError && topics && (
        <QuestionsByTopic
          topics={topics}
          headline="Included Questions"
          expanded
          compact
        />
      )}
    </div>
  );
}
