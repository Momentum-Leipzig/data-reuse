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
              AND (i.item_language = \'en\' OR NOT EXISTS (
                  SELECT 1 FROM item i2
                  WHERE i2.item_name = i.item_name AND i2.item_language = \'en\'
              ))
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
     * Returns all questions that were included in any of the given waves,
     * grouped as: Topic → Construct → Subfacet → Questions.
     *
     * @param string[] $waveNames
     */
    public function getByWaves(array $waveNames): array
    {
        if (empty($waveNames)) {
            return [];
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($waveNames), '?'));

        $sql = "
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
            FROM item_wave iw
            JOIN  item      i    ON i.item_name        = iw.item_name
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
            WHERE iw.wave IN ($placeholders)
              AND COALESCE(c_sf.construct_name, c_ic.construct_name) IS NOT NULL
              AND (i.item_language = 'en' OR NOT EXISTS (
                  SELECT 1 FROM item i2
                  WHERE i2.item_name = i.item_name AND i2.item_language = 'en'
              ))
            ORDER BY
                COALESCE(t_sf.topic_name,     t_ic.topic_name),
                COALESCE(c_sf.construct_name, c_ic.construct_name),
                s.subfacet_name IS NULL,
                s.subfacet_name,
                i.item_name,
                i.item_language
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($waveNames));
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
              AND (i.item_language = \'en\' OR NOT EXISTS (
                  SELECT 1 FROM item i2
                  WHERE i2.item_name = i.item_name AND i2.item_language = \'en\'
              ))
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

    /**
     * Returns detailed information for a list of items (by item_name).
     *
     * Each result contains:
     *   - item text in the requested language (falls back if no translation exists)
     *   - scale name + type
     *   - response options (ordered) in the same language
     *   - instrument name, citation, and bilingual intros
     *   - studies that used the question
     *
     * @param string[] $itemNames
     * @param string   $language  Preferred language code ('en' or 'de'). Defaults to 'en'.
     * @return array
     */
    public function getDetails(array $itemNames, string $language = 'en'): array
    {
        if (empty($itemNames)) {
            return [];
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($itemNames), '?'));

        // ── Query 1: item metadata + scale + response options + instrument ────
        $sql1 = "
            SELECT
                i.item_name,
                i.item_text,
                i.item_language,
                i.reverse_coded,
                i.data_type,
                i.scale_name,
                sc.scale_type,
                i.instrument_name,
                inst.citation        AS instrument_citation,
                inst.general_intro_en,
                inst.general_intro_de,
                ro.option_id,
                ro.label             AS option_label,
                ro.numeric_value     AS option_value
            FROM item i
            LEFT JOIN scale           sc   ON sc.scale_name   = i.scale_name
                                          AND sc.language      = i.item_language
            LEFT JOIN response_option ro   ON ro.scale_name   = i.scale_name
                                          AND ro.language      = i.item_language
            LEFT JOIN instrument      inst ON inst.instrument_name = i.instrument_name
            WHERE i.item_name IN ($placeholders)
              AND (
                  i.item_language = ?
                  OR NOT EXISTS (
                      SELECT 1 FROM item i2
                      WHERE i2.item_name     = i.item_name
                        AND i2.item_language = ?
                  )
              )
            ORDER BY i.item_name, ro.numeric_value, ro.option_id
        ";

        $params1 = array_merge(array_values($itemNames), [$language, $language]);
        $stmt1   = $pdo->prepare($sql1);
        $stmt1->execute($params1);
        $rows1 = $stmt1->fetchAll();

        // Build detail map keyed by item_name
        $details = [];
        foreach ($rows1 as $row) {
            $key = $row['item_name'];
            if (!isset($details[$key])) {
                $details[$key] = [
                    'item_name'           => $row['item_name'],
                    'item_text'           => $row['item_text'],
                    'item_language'       => $row['item_language'],
                    'reverse_coded'       => isset($row['reverse_coded']) ? (bool) $row['reverse_coded'] : null,
                    'data_type'           => $row['data_type'],
                    'scale_name'          => $row['scale_name'],
                    'scale_type'          => $row['scale_type'],
                    'instrument_name'     => $row['instrument_name'],
                    'instrument_citation' => $row['instrument_citation'],
                    'instrument_intro_en' => $row['general_intro_en'],
                    'instrument_intro_de' => $row['general_intro_de'],
                    'response_options'    => [],
                    'studies'             => [],
                ];
            }
            if ($row['option_id'] !== null) {
                $details[$key]['response_options'][] = [
                    'option_id'     => (int) $row['option_id'],
                    'label'         => $row['option_label'],
                    'numeric_value' => $row['option_value'] !== null ? (float) $row['option_value'] : null,
                ];
            }
        }

        // ── Query 2: studies per item ─────────────────────────────────────────
        $sql2 = "
            SELECT DISTINCT
                iw.item_name,
                s.study_name,
                s.title,
                s.doi,
                s.publication_year,
                s.citation,
                s.journal,
                s.comment
            FROM study_item_wave siw
            JOIN item_wave iw ON iw.item_wave_id = siw.item_wave_id
            JOIN study     s  ON s.study_name    = siw.study_name
            WHERE iw.item_name IN ($placeholders)
            ORDER BY iw.item_name, s.study_name
        ";

        $stmt2 = $pdo->prepare($sql2);
        $stmt2->execute(array_values($itemNames));
        $rows2 = $stmt2->fetchAll();

        foreach ($rows2 as $row) {
            $key = $row['item_name'];
            if (isset($details[$key])) {
                $details[$key]['studies'][] = [
                    'study_name'       => $row['study_name'],
                    'title'            => $row['title'],
                    'doi'              => $row['doi'],
                    'publication_year' => $row['publication_year'] !== null ? (int) $row['publication_year'] : null,
                    'citation'         => $row['citation'],
                    'journal'          => $row['journal'],
                    'comment'          => $row['comment'],
                ];
            }
        }

        // Return in the same order the caller passed item_names
        $ordered = [];
        foreach ($itemNames as $name) {
            if (isset($details[$name])) {
                $ordered[] = $details[$name];
            }
        }

        return $ordered;
    }
}
