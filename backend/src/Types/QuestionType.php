<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * GraphQL type for a single question/item within a study.
 * Maps to columns from the "item" table.
 */
class QuestionType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name'   => 'Question',
            'fields' => [
                'item_name' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Unique item identifier',
                ],
                'item_language' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Language code of the item (e.g. "de", "en")',
                ],
                'item_text' => [
                    'type'        => Type::string(),
                    'description' => 'The wording of the question',
                ],
                'reverse_coded' => [
                    'type'        => Type::boolean(),
                    'description' => 'Whether the item is reverse-coded',
                ],
                'data_type' => [
                    'type'        => Type::string(),
                    'description' => 'Data type of the response (integer, float, string, boolean, date)',
                ],
            ],
        ]);
    }
}
