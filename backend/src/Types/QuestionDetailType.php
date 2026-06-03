<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * GraphQL type for the detailed view of a single question/item.
 * Includes scale + response options, instrument info, and studies.
 */
class QuestionDetailType extends ObjectType
{
    public function __construct(ResponseOptionType $responseOptionType, StudyType $studyType)
    {
        parent::__construct([
            'name'   => 'QuestionDetail',
            'fields' => [
                'item_name' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Unique item identifier',
                ],
                'item_text' => [
                    'type'        => Type::string(),
                    'description' => 'The wording of the question in the requested language',
                ],
                'item_language' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Language code of the returned item text (e.g. "de", "en")',
                ],
                'reverse_coded' => [
                    'type'        => Type::boolean(),
                    'description' => 'Whether the item is reverse-coded',
                ],
                'data_type' => [
                    'type'        => Type::string(),
                    'description' => 'Data type of the response (integer, float, string, boolean, date)',
                ],
                'scale_name' => [
                    'type'        => Type::string(),
                    'description' => 'Name of the response scale',
                ],
                'scale_type' => [
                    'type'        => Type::string(),
                    'description' => 'Scale type (ordinal, interval, text, selection)',
                ],
                'response_options' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($responseOptionType))),
                    'description' => 'Ordered list of response options for the scale',
                ],
                'instrument_name' => [
                    'type'        => Type::string(),
                    'description' => 'Name of the instrument this item belongs to',
                ],
                'instrument_citation' => [
                    'type'        => Type::string(),
                    'description' => 'Full citation text for the instrument',
                ],
                'instrument_translation' => [
                    'type'        => Type::string(),
                    'description' => 'Translation note for the instrument',
                ],
                'instrument_comment' => [
                    'type'        => Type::string(),
                    'description' => 'Additional comment about the instrument',
                ],
                'instrument_intro' => [
                    'type'        => Type::string(),
                    'description' => 'General introduction for the instrument in the requested language',
                ],
                'instruction_id' => [
                    'type'        => Type::string(),
                    'description' => 'Instruction identifier for the item (nullable)',
                ],
                'studies' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($studyType))),
                    'description' => 'Studies that used this question',
                ],
            ],
        ]);
    }
}
