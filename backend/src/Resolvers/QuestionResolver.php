<?php

namespace App\Resolvers;

use App\Database\Connection;

/**
 * Resolver for question/item data, including grouped views within a study.
 */
class QuestionResolver
{
    /**
     * Returns all questions used in a given study, grouped as:
     *   Topic → Construct → Subfacet → Questions
     *
     * Each item is deduplicated: if the same item appeared in multiple waves
     * of the study it is only returned once.
     */
    public function getByStudy(string $studyName): array
    {
        $pdo = Connection::get();

        // Items always have a subfacet, construct and topic via the subfacet
        // chain.  When subfacet_name IS NULL on an item we fall back to the
        // instrument_construct table (subfacet_name IS NULL rows) to resolve
        // construct and topic so those items are still included.
        $sql = '
            SELECT DISTINCT
                COALESCE(t_sf.topic_name,     t_ic.topic_name)     AS topic_name,
                COALESCE(t_sf.description,    t_ic.description)    AS topic_description,
                COALESCE(c_sf.construct_name, c_ic.construct_name) AS construct_name,
                COALESCE(c_sf.description,    c_ic.description)    AS construct_description,
                s.subfacet_name,
                s.description                                       AS subfacet_description,
                i.item_name,
                i.item_language,
                i.item_text,
                i.reverse_coded,
                i.data_type
            FROM study_item_wave siw
            JOIN  item_wave iw   ON iw.item_wave_id   = siw.item_wave_id
            JOIN  item      i    ON i.item_name        = iw.item_name
                                AND i.item_language    = iw.item_language
            -- subfacet path (items that have a subfacet)
            LEFT JOIN subfacet  s    ON s.subfacet_name     = i.subfacet_name
            LEFT JOIN construct c_sf ON c_sf.construct_name = s.construct_name
            LEFT JOIN topic     t_sf ON t_sf.topic_name     = c_sf.topic_name
            -- fallback path via instrument_construct (items without a subfacet)
            LEFT JOIN (
                SELECT instrument_name, MIN(construct_name) AS construct_name
                FROM   instrument_construct
                WHERE  subfacet_name IS NULL
                GROUP  BY instrument_name
            ) ic ON ic.instrument_name = i.instrument_name AND i.subfacet_name IS NULL
            LEFT JOIN construct c_ic ON c_ic.construct_name = ic.construct_name
            LEFT JOIN topic     t_ic ON t_ic.topic_name     = c_ic.topic_name
            WHERE siw.study_name = ?
              AND COALESCE(c_sf.construct_name, c_ic.construct_name) IS NOT NULL
            ORDER BY
                COALESCE(t_sf.topic_name,     t_ic.topic_name),
                COALESCE(c_sf.construct_name, c_ic.construct_name),
                s.subfacet_name IS NULL,
                s.subfacet_name,
                i.item_name,
                i.item_language
        ';

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$studyName]);
        $rows = $stmt->fetchAll();

        return $this->groupRows($rows);
    }

    /**
     * Returns every question in the database grouped as:
     *   Topic → Construct → Subfacet → Questions
     */
    public function getAll(): array
    {
        $pdo = Connection::get();

        $sql = '
            SELECT DISTINCT
                COALESCE(t_sf.topic_name,     t_ic.topic_name)     AS topic_name,
                COALESCE(t_sf.description,    t_ic.description)    AS topic_description,
                COALESCE(c_sf.construct_name, c_ic.construct_name) AS construct_name,
                COALESCE(c_sf.description,    c_ic.description)    AS construct_description,
                s.subfacet_name,
                s.description                                       AS subfacet_description,
                i.item_name,
                i.item_language,
                i.item_text,
                i.reverse_coded,
                i.data_type
            FROM item i
            LEFT JOIN subfacet  s    ON s.subfacet_name     = i.subfacet_name
            LEFT JOIN construct c_sf ON c_sf.construct_name = s.construct_name
            LEFT JOIN topic     t_sf ON t_sf.topic_name     = c_sf.topic_name
            LEFT JOIN (
                SELECT instrument_name, MIN(construct_name) AS construct_name
                FROM   instrument_construct
                WHERE  subfacet_name IS NULL
                GROUP  BY instrument_name
            ) ic ON ic.instrument_name = i.instrument_name AND i.subfacet_name IS NULL
            LEFT JOIN construct c_ic ON c_ic.construct_name = ic.construct_name
            LEFT JOIN topic     t_ic ON t_ic.topic_name     = c_ic.topic_name
            WHERE COALESCE(c_sf.construct_name, c_ic.construct_name) IS NOT NULL
            ORDER BY
                COALESCE(t_sf.topic_name,     t_ic.topic_name),
                COALESCE(c_sf.construct_name, c_ic.construct_name),
                s.subfacet_name IS NULL,
                s.subfacet_name,
                i.item_name,
                i.item_language
        ';

        $stmt = $pdo->query($sql);
        return $this->groupRows($stmt->fetchAll());
    }

    /**
     * Transforms the flat SQL result rows into a nested
     * Topic → Construct → Subfacet → Questions structure.
     */
    private function groupRows(array $rows): array
    {
        $topics = [];

        foreach ($rows as $row) {
            $tKey = $row['topic_name'];
            $cKey = $row['construct_name'];
            // null subfacet_name: items group directly under the construct.
            // Use empty string as the array key so isset() works correctly.
            $sKey = $row['subfacet_name'] ?? '';

            if (!isset($topics[$tKey])) {
                $topics[$tKey] = [
                    'topic_name'  => $tKey,
                    'description' => $row['topic_description'],
                    'constructs'  => [],
                ];
            }

            if (!isset($topics[$tKey]['constructs'][$cKey])) {
                $topics[$tKey]['constructs'][$cKey] = [
                    'construct_name' => $cKey,
                    'description'    => $row['construct_description'],
                    'subfacets'      => [],
                ];
            }

            if (!isset($topics[$tKey]['constructs'][$cKey]['subfacets'][$sKey])) {
                $topics[$tKey]['constructs'][$cKey]['subfacets'][$sKey] = [
                    'subfacet_name' => $sKey,
                    'description'   => $row['subfacet_description'],
                    'questions'     => [],
                ];
            }

            $topics[$tKey]['constructs'][$cKey]['subfacets'][$sKey]['questions'][] = [
                'item_name'     => $row['item_name'],
                'item_language' => $row['item_language'],
                'item_text'     => $row['item_text'],
                'reverse_coded' => isset($row['reverse_coded']) ? (bool) $row['reverse_coded'] : null,
                'data_type'     => $row['data_type'],
            ];
        }

        // Re-index associative arrays to plain indexed arrays for GraphQL
        return array_values(array_map(function (array $topic): array {
            $topic['constructs'] = array_values(array_map(function (array $construct): array {
                $construct['subfacets'] = array_values($construct['subfacets']);
                return $construct;
            }, $topic['constructs']));
            return $topic;
        }, $topics));
    }
}
