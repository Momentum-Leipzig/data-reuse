<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * GraphQL type for a single measurement point (wave) with its participant count.
 */
class WaveParticipantsType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name'        => 'WaveParticipants',
            'description' => 'Participant count for a single measurement point (wave)',
            'fields'      => [
                'wave' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Wave label, e.g. T01',
                ],
                'month' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'ISO date of the wave (YYYY-MM-DD)',
                ],
                'participants' => [
                    'type'        => Type::nonNull(Type::int()),
                    'description' => 'Number of distinct participants in this wave',
                ],
            ],
        ]);
    }
}
