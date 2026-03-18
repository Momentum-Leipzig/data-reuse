<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * GraphQL type for the "study" table.
 * Each field maps to a column in the database.
 */
class StudyType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name'   => 'Study',
            'fields' => [
                'study_name' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Unique study identifier (primary key)',
                ],
                'title' => [
                    'type'        => Type::string(),
                    'description' => 'Title of the study',
                ],
                'doi' => [
                    'type'        => Type::string(),
                    'description' => 'Digital Object Identifier',
                ],
                'publication_year' => [
                    'type'        => Type::int(),
                    'description' => 'Year of publication',
                ],
                'citation' => [
                    'type'        => Type::string(),
                    'description' => 'Citation text',
                ],
                'journal' => [
                    'type'        => Type::string(),
                    'description' => 'Journal name',
                ],
            ],
        ]);
    }
}
