<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * GraphQL type for dataset metrics (questions, participants, waves, responses).
 */
class MetricsType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name'        => 'Metrics',
            'description' => 'Aggregate counts for a (possibly filtered) slice of the dataset',
            'fields'      => [
                'questions' => [
                    'type'        => Type::nonNull(Type::int()),
                    'description' => 'Number of distinct questions/items',
                ],
                'participants' => [
                    'type'        => Type::nonNull(Type::int()),
                    'description' => 'Number of distinct participants who responded',
                ],
                'measurementPoints' => [
                    'type'        => Type::nonNull(Type::int()),
                    'description' => 'Number of distinct measurement points (waves)',
                ],
                'dataPoints' => [
                    'type'        => Type::nonNull(Type::int()),
                    'description' => 'Total number of responses across measurement points',
                ],
            ],
        ]);
    }
}
