<?php

namespace App\Resolvers;

use App\Database\Connection;

/**
 * Resolver for the "study" table — contains all DB queries for studies.
 */
class StudyResolver
{
    /**
     * Fetch all studies from the database.
     */
    public function getAll(): array
    {
        $pdo  = Connection::get();
        $stmt = $pdo->query('SELECT * FROM study ORDER BY study_name');
        return $stmt->fetchAll();
    }

    /**
     * Fetch a single study by its study_name (primary key).
     */
    public function getByName(string $studyName): ?array
    {
        $pdo  = Connection::get();
        $stmt = $pdo->prepare('SELECT * FROM study WHERE study_name = :study_name LIMIT 1');
        $stmt->execute([':study_name' => $studyName]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * Fetch all studies that use at least one of the given item_names.
     *
     * @param string[] $itemNames
     * @return array
     */
    public function getByItems(array $itemNames): array
    {
        if (empty($itemNames)) {
            return [];
        }

        $pdo = Connection::get();
        $placeholders = implode(',', array_fill(0, count($itemNames), '?'));

        $sql = "
            SELECT DISTINCT s.*
            FROM study s
            JOIN study_item_wave siw ON siw.study_name = s.study_name
            JOIN item_wave iw        ON iw.item_wave_id = siw.item_wave_id
            WHERE iw.item_name IN ($placeholders)
            ORDER BY s.study_name
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($itemNames));
        return $stmt->fetchAll();
    }
}
