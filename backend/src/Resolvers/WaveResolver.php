<?php

namespace App\Resolvers;

use App\Database\Connection;

/**
 * Resolver for per-wave participant counts used by the WaveParticipantsChart.
 *
 * Each public method returns an array of rows:
 *   [['wave' => 'T01', 'month' => '2020-03-01', 'participants' => 1234], …]
 * ordered chronologically by wave month.
 */
class WaveResolver
{
    /**
     * Participant counts for all waves in the dataset.
     *
     * Uses participant_wave (one row per participant × wave) rather than
     * response, so every participant who took part in a wave is counted once
     * regardless of how many items they answered.
     */
    public function getAll(): array
    {
        $pdo = Connection::get();

        $rows = $pdo->query('
            SELECT
                pw.wave,
                w.month,
                COUNT(DISTINCT pw.participant_id) AS participants
            FROM participant_wave pw
            JOIN wave w ON w.label = pw.wave
            GROUP BY pw.wave, w.month
            ORDER BY w.month
        ')->fetchAll();

        return $this->mapRows($rows);
    }

    /**
     * Participant counts per wave, restricted to the given studies.
     *
     * A participant is counted in a wave if they have at least one response
     * to an item-wave that belongs to one of the given studies.
     *
     * @param string[] $studyNames
     */
    public function getByStudies(array $studyNames): array
    {
        if (empty($studyNames)) {
            return [];
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($studyNames), '?'));

        $stmt = $pdo->prepare("
            SELECT
                iw.wave,
                w.month,
                COUNT(DISTINCT r.participant_id) AS participants
            FROM study_item_wave siw
            JOIN item_wave iw ON iw.item_wave_id = siw.item_wave_id
            JOIN response  r  ON r.item_wave_id  = siw.item_wave_id
            JOIN wave      w  ON w.label          = iw.wave
            WHERE siw.study_name IN ($placeholders)
            GROUP BY iw.wave, w.month
            ORDER BY w.month
        ");

        $stmt->execute(array_values($studyNames));
        return $this->mapRows($stmt->fetchAll());
    }

    /**
     * Participant counts per wave, restricted to the given item_names.
     *
     * @param string[] $itemNames
     */
    public function getByQuestions(array $itemNames): array
    {
        if (empty($itemNames)) {
            return [];
        }

        $pdo          = Connection::get();
        $placeholders = implode(',', array_fill(0, count($itemNames), '?'));

        $stmt = $pdo->prepare("
            SELECT
                iw.wave,
                w.month,
                COUNT(DISTINCT r.participant_id) AS participants
            FROM item_wave iw
            JOIN response r ON r.item_wave_id = iw.item_wave_id
            JOIN wave     w ON w.label         = iw.wave
            WHERE iw.item_name IN ($placeholders)
            GROUP BY iw.wave, w.month
            ORDER BY w.month
        ");

        $stmt->execute(array_values($itemNames));
        return $this->mapRows($stmt->fetchAll());
    }

    // -------------------------------------------------------------------------

    private function mapRows(array $rows): array
    {
        return array_map(fn($row) => [
            'wave'         => (string) $row['wave'],
            'month'        => (string) $row['month'],
            'participants' => (int)    $row['participants'],
        ], $rows);
    }
}
