<?php

namespace App\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class WaveInstructionType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name'   => 'WaveInstruction',
            'fields' => [
                'wave' => [
                    'type'        => Type::nonNull(Type::string()),
                    'description' => 'Wave identifier',
                ],
                'instruction_text' => [
                    'type'        => Type::string(),
                    'description' => 'Instruction text for this wave in the requested language',
                ],
            ],
        ]);
    }
}
