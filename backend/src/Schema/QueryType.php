<?php

namespace App\Schema;

use App\Resolvers\StudyResolver;
use App\Types\StudyType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * Root Query type — add a field here for every query your frontend needs.
 */
class QueryType extends ObjectType
{
    public function __construct()
    {
        $studyType     = new StudyType();
        $studyResolver = new StudyResolver();

        parent::__construct([
            'name'   => 'Query',
            'fields' => [

                // Query: { studies { study_name title doi } }
                'studies' => [
                    'type'        => Type::listOf($studyType),
                    'description' => 'Returns all studies',
                    'resolve'     => fn() => $studyResolver->getAll(),
                ],

                // Query: { study(study_name: "abc") { title doi publication_year } }
                'study' => [
                    'type'        => $studyType,
                    'description' => 'Returns a single study by study_name',
                    'args'        => [
                        'study_name' => [
                            'type'        => Type::nonNull(Type::string()),
                            'description' => 'The study_name (primary key)',
                        ],
                    ],
                    'resolve' => fn($root, array $args) => $studyResolver->getByName($args['study_name']),
                ],

            ],
        ]);
    }
}
