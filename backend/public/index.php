<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Schema\QueryType;
use GraphQL\GraphQL;
use GraphQL\Type\Schema;
use GraphQL\Error\DebugFlag;

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow your Next.js frontend to call this API.
// In production replace '*' with your actual frontend URL.
$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: '*';

header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request (sent by browsers before POST)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');

// ─── Only accept POST ────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['errors' => [['message' => 'Method not allowed. Use POST.']]]);
    exit;
}

// ─── Parse request body ──────────────────────────────────────────────────────
$rawInput = file_get_contents('php://input');
$input    = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE || !isset($input['query'])) {
    http_response_code(400);
    echo json_encode(['errors' => [['message' => 'Invalid JSON or missing query']]]);
    exit;
}

$query         = $input['query'];
$variables     = $input['variables'] ?? null;
$operationName = $input['operationName'] ?? null;

// ─── Build schema & execute ──────────────────────────────────────────────────
try {
    $schema = new Schema([
        'query' => new QueryType(),
    ]);

    // Show full debug info locally, hide in production
    $debug = getenv('APP_ENV') === 'production'
        ? DebugFlag::NONE
        : DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE;

    $result = GraphQL::executeQuery($schema, $query, null, null, $variables, $operationName);
    $output = $result->toArray($debug);

} catch (\Throwable $e) {
    http_response_code(500);
    $output = [
        'errors' => [[
            'message' => getenv('APP_ENV') === 'production'
                ? 'Internal server error'
                : $e->getMessage(),
        ]],
    ];
}

echo json_encode($output);