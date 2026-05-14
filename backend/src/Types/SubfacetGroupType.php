<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * A subfacet together with the questions (items) that belong to it,
 * in the context of a specific study.
 */
class SubfacetGroupType extends ObjectType
{
    public function __construct(QuestionType $questionType)
    {
        parent::__construct([
            'name'   => 'SubfacetGroup',
            'fields' => [
                'subfacet_name' => [
                    'type'        => Type::string(),
                    'description' => 'Name of the subfacet, or null for items grouped directly under the construct',
                ],
                'description' => [
                    'type'        => Type::string(),
                    'description' => 'Description of the subfacet',
                ],
                'questions' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($questionType))),
                    'description' => 'Questions belonging to this subfacet in the study',
                ],
            ],
        ]);
    }
}
