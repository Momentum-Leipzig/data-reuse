<?php

// Default database configuration.
// For local development, create a "database.local.php" in this folder
// with the same structure but your real credentials.
// database.local.php is gitignored and will never be committed.

return [
    'host'     => getenv('DB_HOST')     ?: 'localhost',
    'database' => getenv('DB_NAME')     ?: 'your_database',
    'username' => getenv('DB_USER')     ?: 'your_username',
    'password' => getenv('DB_PASSWORD') ?: 'your_password',
];
