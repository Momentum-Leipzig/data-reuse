<?php

namespace App\Database;

use PDO;
use PDOException;

class Connection
{
    private static ?PDO $instance = null;

    public static function get(): PDO
    {
        if (self::$instance === null) {
            // Use database.local.php if it exists (gitignored, real credentials),
            // otherwise fall back to database.php (committed, placeholder values).
            $localConfig = __DIR__ . '/../../config/database.local.php';
            $defaultConfig = __DIR__ . '/../../config/database.php';

            $config = file_exists($localConfig)
                ? require $localConfig
                : require $defaultConfig;

            // Separate host and port (supports both "localhost" and "127.0.0.1:4406")
            $host = $config['host'];
            $port = 3306;
            if (str_contains($host, ':')) {
                [$host, $port] = explode(':', $host, 2);
                $port = (int) $port;
            }

            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                $host,
                $port,
                $config['database']
            );

            try {
                self::$instance = new PDO($dsn, $config['username'], $config['password'], [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                throw new \RuntimeException('Database connection failed: ' . $e->getMessage());
            }
        }

        return self::$instance;
    }

    private function __construct() {}
    private function __clone() {}
}
