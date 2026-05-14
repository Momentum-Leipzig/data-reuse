<?php

namespace App\Schema;

use App\Resolvers\MetricsResolver;
use App\Resolvers\QuestionResolver;
use App\Resolvers\StudyResolver;
use App\Resolvers\WaveResolver;
use App\Types\ConstructGroupType;
use App\Types\MetricsType;
use App\Types\QuestionType;
use App\Types\StudyType;
use App\Types\SubfacetGroupType;
use App\Types\TopicGroupType;
use App\Types\WaveParticipantsType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * Root Query type — add a field here for every query your frontend needs.
 */
class QueryType extends ObjectType
{
    public function __construct()
    {
        $metricsType     = new MetricsType();
        $metricsResolver = new MetricsResolver();

        $waveParticipantsType = new WaveParticipantsType();
        $waveResolver         = new WaveResolver();

        $studyType     = new StudyType();
        $studyResolver = new StudyResolver();

        $questionType      = new QuestionType();
        $subfacetGroupType = new SubfacetGroupType($questionType);
        $constructGroupType = new ConstructGroupType($subfacetGroupType);
        $topicGroupType    = new TopicGroupType($constructGroupType);
        $questionResolver  = new QuestionResolver();

        parent::__construct([
            'name'   => 'Query',
            'fields' => [

                // Query: { globalMetrics { questions participants measurementPoints dataPoints } }
                'globalMetrics' => [
                    'type'        => Type::nonNull($metricsType),
                    'description' => 'Aggregate counts for the entire dataset',
                    'resolve'     => fn() => $metricsResolver->getGlobal(),
                ],

                // Query: { metricsByStudies(study_names: ["..."]){ questions participants ... } }
                'metricsByStudies' => [
                    'type'        => Type::nonNull($metricsType),
                    'description' => 'Aggregate counts filtered to the given studies',
                    'args'        => [
                        'study_names' => [
                            'type'        => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
                            'description' => 'List of study_name values to filter by',
                        ],
                    ],
                    'resolve' => fn($root, array $args) => $metricsResolver->getByStudies($args['study_names']),
                ],

                // Query: { metricsByQuestions(item_names: ["..."]){ questions participants ... } }
                'metricsByQuestions' => [
                    'type'        => Type::nonNull($metricsType),
                    'description' => 'Aggregate counts filtered to the given questions',
                    'args'        => [
                        'item_names' => [
                            'type'        => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
                            'description' => 'List of item_name values to filter by',
                        ],
                    ],
                    'resolve' => fn($root, array $args) => $metricsResolver->getByQuestions($args['item_names']),
                ],

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

                // Query: { allQuestions { topic_name constructs { ... } } }
                'allQuestions' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($topicGroupType))),
                    'description' => 'Returns all questions grouped by topic → construct → subfacet',
                    'resolve'     => fn() => $questionResolver->getAll(),
                ],

                // Query: { studyQuestions(study_name: "abc") { topic_name constructs { ... } } }
                'studyQuestions' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($topicGroupType))),
                    'description' => 'Returns all questions in a study grouped by topic → construct → subfacet',
                    'args'        => [
                        'study_name' => [
                            'type'        => Type::nonNull(Type::string()),
                            'description' => 'The study_name to fetch questions for',
                        ],
                    ],
                    'resolve' => fn($root, array $args) => $questionResolver->getByStudy($args['study_name']),
                ],

                // Query: { waveParticipants { wave month participants } }
                'waveParticipants' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($waveParticipantsType))),
                    'description' => 'Participant count per wave for the entire dataset',
                    'resolve'     => fn() => $waveResolver->getAll(),
                ],

                // Query: { waveParticipantsByStudies(study_names: ["..."]){ wave month participants } }
                'waveParticipantsByStudies' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($waveParticipantsType))),
                    'description' => 'Participant count per wave, restricted to the given studies',
                    'args'        => [
                        'study_names' => [
                            'type'        => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
                            'description' => 'List of study_name values to filter by',
                        ],
                    ],
                    'resolve' => fn($root, array $args) => $waveResolver->getByStudies($args['study_names']),
                ],

                // Query: { waveParticipantsByQuestions(item_names: ["..."]){ wave month participants } }
                'waveParticipantsByQuestions' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($waveParticipantsType))),
                    'description' => 'Participant count per wave, restricted to the given questions',
                    'args'        => [
                        'item_names' => [
                            'type'        => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
                            'description' => 'List of item_name values to filter by',
                        ],
                    ],
                    'resolve' => fn($root, array $args) => $waveResolver->getByQuestions($args['item_names']),
                ],

                // Query: { studiesByQuestions(item_names: ["a", "b"]) { study_name title } }
                'studiesByQuestions' => [
                    'type'        => Type::nonNull(Type::listOf(Type::nonNull($studyType))),
                    'description' => 'Returns all studies that use at least one of the given item_names',
                    'args'        => [
                        'item_names' => [
                            'type'        => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
                            'description' => 'List of item_name values to filter by',
                        ],
                    ],
                    'resolve' => fn($root, array $args) => $studyResolver->getByItems($args['item_names']),
                ],

            ],
        ]);
    }
}
