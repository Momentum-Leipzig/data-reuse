<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * A topic together with the constructs that belong to it,
 * in the context of a specific study.
 */
class TopicGroupType extends ObjectType
{
    public function __construct(ConstructGroupType $constructGroupType)
    {
        parent::__construct([
            'name'   => 'TopicGroup',
            'fields' => [
                'topic_name' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Name of the topic',
                ],
                'description' => [
                    'type'        => Type::string(),
                    'description' => 'Description of the topic',
                ],
                'constructs' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($constructGroupType))),
                    'description' => 'Constructs belonging to this topic in the study',
                ],
            ],
        ]);
    }
}
