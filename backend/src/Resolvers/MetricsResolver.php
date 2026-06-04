<?php

namespace App\Resolvers;

use App\Database\Connection;

/**
 * Resolver for aggregate dataset metrics shown in MetricsOverview.
 *
 * Each public method returns an associative array with the four keys that
 * MetricsType exposes: questions, participants, measurementPoints, dataPoints.
 *
 * "participants" is always COUNT(DISTINCT participant_id) FROM response (i.e.
 * participants who actually responded), filtered to the relevant scope.
 */
class MetricsResolver
{
    /**
     * Counts for the entire dataset.
     *
     * The result is stored in a temp file and reused until it expires (24 h).
     * This avoids running COUNT(DISTINCT …) on 17 M+ response rows on every
     * page load, and prevents a slow first request from blocking other API
     * calls on single-worker dev servers.
     *
     * To force a refresh, delete /tmp/lmp_global_metrics.json on the server.
     */
    public function getGlobal(): array
    {
        $cacheFile = sys_get_temp_dir() . '/lmp_global_metrics.json';
        $ttl       = 60 * 60 * 24; // 24 hours

        if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
            $cached = json_decode(file_get_contents($cacheFile), true);
            if (is_array($cached)) {
                return $cached;
            }
        }

        $pdo = Connection::get();

        $row = $pdo->query('
            SELECT
                (SELECT COUNT(DISTINCT item_name)      FROM item)         AS questions,
                (SELECT COUNT(DISTINCT participant_id) FROM response)     AS participants,
                (SELECT COUNT(*)                       FROM wave)         AS measurementPoints,
                (SELECT COUNT(*)                       FROM response)     AS dataPoints
        ')->fetch();

        $result = $this->mapRow($row);

        // Atomic write — prevents a concurrent request reading a partial file.
        $tmp = $cacheFile . '.tmp.' . getmypid();
        file_put_contents($tmp, json_encode($result));
        rename($tmp, $cacheFile);

        return $result;
    }

    /**
     * Counts restricted to the given studies.
     *
     * @param string[] $studyNames
     */
    public function getByStudies(array $studyNames): array
    {
        if (empty($studyNames)) {
            return $this->zeros();
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($studyNames), '?'));

        // All four metrics share the same base filter: item_waves that belong
        // to the requested studies via study_item_wave.
        $sql = "
            SELECT
                (
                    SELECT COUNT(DISTINCT iw.item_name)
                    FROM   study_item_wave siw
                    JOIN   item_wave iw ON iw.item_wave_id = siw.item_wave_id
                    WHERE  siw.study_name IN ($placeholders)
                ) AS questions,
                (
                    SELECT COUNT(DISTINCT r.participant_id)
                    FROM   study_item_wave siw
                    JOIN   response r ON r.item_wave_id = siw.item_wave_id
                    WHERE  siw.study_name IN ($placeholders)
                ) AS participants,
                (
                    SELECT COUNT(DISTINCT iw.wave)
                    FROM   study_item_wave siw
                    JOIN   item_wave iw ON iw.item_wave_id = siw.item_wave_id
                    WHERE  siw.study_name IN ($placeholders)
                ) AS measurementPoints,
                (
                    SELECT COUNT(*)
                    FROM   study_item_wave siw
                    JOIN   response r ON r.item_wave_id = siw.item_wave_id
                    WHERE  siw.study_name IN ($placeholders)
                ) AS dataPoints
        ";

        // Each sub-SELECT needs its own copy of the placeholder values.
        $params = array_merge(
            array_values($studyNames),
            array_values($studyNames),
            array_values($studyNames),
            array_values($studyNames),
        );

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $this->mapRow($stmt->fetch());
    }

    /**
     * Counts restricted to participants who participated in ALL of the given studies.
     *
     * @param string[] $studyNames
     */
    public function getByStudiesAnd(array $studyNames): array
    {
        if (empty($studyNames)) {
            return $this->zeros();
        }

        if (count($studyNames) === 1) {
            return $this->getByStudies($studyNames);
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($studyNames), '?'));
        $n            = count($studyNames);

        $sql = "
            SELECT
                (
                    SELECT COUNT(DISTINCT iw.item_name)
                    FROM   study_item_wave siw
                    JOIN   item_wave iw ON iw.item_wave_id = siw.item_wave_id
                    WHERE  siw.study_name IN ($placeholders)
                ) AS questions,
                (
                    SELECT COUNT(DISTINCT participant_id)
                    FROM (
                        SELECT r.participant_id
                        FROM   study_item_wave siw
                        JOIN   response r ON r.item_wave_id = siw.item_wave_id
                        WHERE  siw.study_name IN ($placeholders)
                        GROUP  BY r.participant_id
                        HAVING COUNT(DISTINCT siw.study_name) = $n
                    ) AS sub
                ) AS participants,
                (
                    SELECT COUNT(DISTINCT iw.wave)
                    FROM   study_item_wave siw
                    JOIN   item_wave iw ON iw.item_wave_id = siw.item_wave_id
                    WHERE  siw.study_name IN ($placeholders)
                ) AS measurementPoints,
                (
                    SELECT COUNT(*)
                    FROM   study_item_wave siw
                    JOIN   response r ON r.item_wave_id = siw.item_wave_id
                    WHERE  siw.study_name IN ($placeholders)
                      AND  r.participant_id IN (
                        SELECT r2.participant_id
                        FROM   study_item_wave siw2
                        JOIN   response r2 ON r2.item_wave_id = siw2.item_wave_id
                        WHERE  siw2.study_name IN ($placeholders)
                        GROUP  BY r2.participant_id
                        HAVING COUNT(DISTINCT siw2.study_name) = $n
                      )
                ) AS dataPoints
        ";

        $params = array_merge(
            array_values($studyNames),
            array_values($studyNames),
            array_values($studyNames),
            array_values($studyNames),
            array_values($studyNames),
        );

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $this->mapRow($stmt->fetch());
    }

    /**
     * Counts restricted to the given item_names (questions).
     *
     * @param string[] $itemNames
     */
    public function getByQuestions(array $itemNames): array
    {
        if (empty($itemNames)) {
            return $this->zeros();
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($itemNames), '?'));

        $sql = "
            SELECT
                (
                    SELECT COUNT(DISTINCT iw.item_name)
                    FROM   item_wave iw
                    WHERE  iw.item_name IN ($placeholders)
                ) AS questions,
                (
                    SELECT COUNT(DISTINCT r.participant_id)
                    FROM   item_wave iw
                    JOIN   response r ON r.item_wave_id = iw.item_wave_id
                    WHERE  iw.item_name IN ($placeholders)
                ) AS participants,
                (
                    SELECT COUNT(DISTINCT iw.wave)
                    FROM   item_wave iw
                    WHERE  iw.item_name IN ($placeholders)
                ) AS measurementPoints,
                (
                    SELECT COUNT(*)
                    FROM   item_wave iw
                    JOIN   response r ON r.item_wave_id = iw.item_wave_id
                    WHERE  iw.item_name IN ($placeholders)
                ) AS dataPoints
        ";

        $params = array_merge(
            array_values($itemNames),
            array_values($itemNames),
            array_values($itemNames),
            array_values($itemNames),
        );

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $this->mapRow($stmt->fetch());
    }

    /**
     * Counts restricted to participants who answered ALL of the given questions.
     *
     * @param string[] $itemNames
     */
    public function getByQuestionsAnd(array $itemNames): array
    {
        if (empty($itemNames)) {
            return $this->zeros();
        }

        if (count($itemNames) === 1) {
            return $this->getByQuestions($itemNames);
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($itemNames), '?'));
        $n            = count($itemNames);

        // $n is injected directly (it's an integer from count(), never user input).
        $sql = "
            SELECT
                $n AS questions,
                (
                    SELECT COUNT(DISTINCT participant_id)
                    FROM (
                        SELECT r.participant_id
                        FROM   item_wave iw
                        JOIN   response r ON r.item_wave_id = iw.item_wave_id
                        WHERE  iw.item_name IN ($placeholders)
                        GROUP  BY r.participant_id
                        HAVING COUNT(DISTINCT iw.item_name) = $n
                    ) AS sub
                ) AS participants,
                (
                    SELECT COUNT(DISTINCT wave)
                    FROM (
                        SELECT iw.wave
                        FROM   item_wave iw
                        WHERE  iw.item_name IN ($placeholders)
                        GROUP  BY iw.wave
                        HAVING COUNT(DISTINCT iw.item_name) = $n
                    ) AS sub
                ) AS measurementPoints,
                (
                    SELECT COUNT(*)
                    FROM   item_wave iw
                    JOIN   response r ON r.item_wave_id = iw.item_wave_id
                    WHERE  iw.item_name IN ($placeholders)
                      AND  r.participant_id IN (
                        SELECT r2.participant_id
                        FROM   item_wave iw2
                        JOIN   response r2 ON r2.item_wave_id = iw2.item_wave_id
                        WHERE  iw2.item_name IN ($placeholders)
                        GROUP  BY r2.participant_id
                        HAVING COUNT(DISTINCT iw2.item_name) = $n
                      )
                ) AS dataPoints
        ";

        $params = array_merge(
            array_values($itemNames),
            array_values($itemNames),
            array_values($itemNames),
            array_values($itemNames),
        );

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $this->mapRow($stmt->fetch());
    }

    // -------------------------------------------------------------------------

    /**
     * Counts restricted to the given wave names.
     *
     * @param string[] $waveNames
     */
    public function getByWaves(array $waveNames): array
    {
        if (empty($waveNames)) {
            return $this->zeros();
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($waveNames), '?'));

        $sql = "
            SELECT
                (
                    SELECT COUNT(DISTINCT iw.item_name)
                    FROM   item_wave iw
                    WHERE  iw.wave IN ($placeholders)
                ) AS questions,
                (
                    SELECT COUNT(DISTINCT r.participant_id)
                    FROM   item_wave iw
                    JOIN   response r ON r.item_wave_id = iw.item_wave_id
                    WHERE  iw.wave IN ($placeholders)
                ) AS participants,
                (
                    SELECT COUNT(DISTINCT iw.wave)
                    FROM   item_wave iw
                    WHERE  iw.wave IN ($placeholders)
                ) AS measurementPoints,
                (
                    SELECT COUNT(*)
                    FROM   item_wave iw
                    JOIN   response r ON r.item_wave_id = iw.item_wave_id
                    WHERE  iw.wave IN ($placeholders)
                ) AS dataPoints
        ";

        $params = array_merge(
            array_values($waveNames),
            array_values($waveNames),
            array_values($waveNames),
            array_values($waveNames),
        );

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $this->mapRow($stmt->fetch());
    }

    /**
     * Counts restricted to participants who participated in ALL of the given waves.
     *
     * @param string[] $waveNames
     */
    public function getByWavesAnd(array $waveNames): array
    {
        if (empty($waveNames)) {
            return $this->zeros();
        }

        if (count($waveNames) === 1) {
            return $this->getByWaves($waveNames);
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($waveNames), '?'));
        $n            = count($waveNames);

        $sql = "
            SELECT
                (
                    SELECT COUNT(DISTINCT iw.item_name)
                    FROM   item_wave iw
                    WHERE  iw.wave IN ($placeholders)
                      AND  (
                        SELECT COUNT(DISTINCT iw2.wave)
                        FROM item_wave iw2
                        WHERE iw2.item_name = iw.item_name
                          AND iw2.wave IN ($placeholders)
                      ) = $n
                ) AS questions,
                (
                    SELECT COUNT(DISTINCT participant_id)
                    FROM (
                        SELECT r.participant_id
                        FROM   item_wave iw
                        JOIN   response r ON r.item_wave_id = iw.item_wave_id
                        WHERE  iw.wave IN ($placeholders)
                        GROUP  BY r.participant_id
                        HAVING COUNT(DISTINCT iw.wave) = $n
                    ) AS sub
                ) AS participants,
                $n AS measurementPoints,
                (
                    SELECT COUNT(*)
                    FROM   item_wave iw
                    JOIN   response r ON r.item_wave_id = iw.item_wave_id
                    WHERE  iw.wave IN ($placeholders)
                      AND  r.participant_id IN (
                        SELECT r2.participant_id
                        FROM   item_wave iw2
                        JOIN   response r2 ON r2.item_wave_id = iw2.item_wave_id
                        WHERE  iw2.wave IN ($placeholders)
                        GROUP  BY r2.participant_id
                        HAVING COUNT(DISTINCT iw2.wave) = $n
                      )
                ) AS dataPoints
        ";

        $params = array_merge(
            array_values($waveNames),
            array_values($waveNames),
            array_values($waveNames),
            array_values($waveNames),
            array_values($waveNames),
        );

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $this->mapRow($stmt->fetch());
    }

    // -------------------------------------------------------------------------

    private function mapRow(array $row): array
    {
        return [
            'questions'         => (int) $row['questions'],
            'participants'      => (int) $row['participants'],
            'measurementPoints' => (int) $row['measurementPoints'],
            'dataPoints'        => (int) $row['dataPoints'],
        ];
    }

    private function zeros(): array
    {
        return [
            'questions'         => 0,
            'participants'      => 0,
            'measurementPoints' => 0,
            'dataPoints'        => 0,
        ];
    }
}
