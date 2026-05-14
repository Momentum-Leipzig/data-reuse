<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * A construct together with the subfacets that belong to it,
 * in the context of a specific study.
 */
class ConstructGroupType extends ObjectType
{
    public function __construct(SubfacetGroupType $subfacetGroupType)
    {
        parent::__construct([
            'name'   => 'ConstructGroup',
            'fields' => [
                'construct_name' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Name of the construct',
                ],
                'description' => [
                    'type'        => Type::string(),
                    'description' => 'Description of the construct',
                ],
                'subfacets' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($subfacetGroupType))),
                    'description' => 'Subfacets belonging to this construct in the study',
                ],
            ],
        ]);
    }
}
