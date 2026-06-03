<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * GraphQL type for a single response option belonging to a scale.
 * Maps to columns from the "response_option" table.
 */
class ResponseOptionType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name'   => 'ResponseOption',
            'fields' => [
                'option_id' => [
                    'type'        => Type::nonNull(Type::int()),
                    'description' => 'Auto-increment primary key',
                ],
                'label' => [
                    'type'        => Type::string(),
                    'description' => 'Human-readable label for the response option',
                ],
                'numeric_value' => [
                    'type'        => Type::float(),
                    'description' => 'Numeric value assigned to the option (nullable)',
                ],
            ],
        ]);
    }
}
