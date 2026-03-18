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
}
