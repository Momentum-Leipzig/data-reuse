# Database Schema — `lmp`

> Pulled 2026-05-14. Host `127.0.0.1:4406`.

---

## Table overview

| Table                   | Rows       | Purpose                                                         |
| ----------------------- | ---------- | --------------------------------------------------------------- |
| `topic`                 | ~?         | Top-level grouping for constructs                               |
| `construct`             | 111        | Psychological constructs, each belongs to a topic               |
| `subfacet`              | 100        | Sub-dimension of a construct (nullable on items)                |
| `instrument`            | 115        | Survey instruments / questionnaires                             |
| `instrument_construct`  | 188        | M:N link between instruments and constructs/subfacets           |
| `scale`                 | 120        | Response scales (ordinal, interval, text, selection)            |
| `response_option`       | 612        | Individual answer options per scale                             |
| `instruction`           | 264        | Survey instructions (per instruction_id + reference + language) |
| `item`                  | 1 355      | Individual questions/items                                      |
| `wave`                  | –          | Data collection waves (T01, T02, …)                             |
| `item_wave`             | 19 566     | Which items were used in which wave                             |
| `participant`           | 2 875      | Study participants                                              |
| `participant_wave`      | 58 445     | Which participant took part in which wave                       |
| `response`              | 17 831 986 | Participant responses to item-wave combinations                 |
| `study`                 | 26         | Published studies that use subsets of this data                 |
| `study_item_wave`       | 5 071      | Which item-waves belong to a study (+ their role)               |
| `temp_instruction_wave` | 4 120      | Temporary/denormalised instruction lookup                       |

---

## Detailed columns

### `topic`

| Column        | Type         | Key | Notes |
| ------------- | ------------ | --- | ----- |
| `topic_name`  | varchar(255) | PRI |       |
| `description` | text         |     |       |

---

### `construct`

| Column           | Type         | Key | Notes                   |
| ---------------- | ------------ | --- | ----------------------- |
| `construct_name` | varchar(255) | PRI |                         |
| `topic_name`     | varchar(255) | MUL | FK → `topic.topic_name` |
| `description`    | text         |     |                         |

**Sample:** `"Affect"` → topic `"Work-Related Attitudes and Well-Being"`

---

### `subfacet`

| Column           | Type         | Key | Notes                           |
| ---------------- | ------------ | --- | ------------------------------- |
| `subfacet_name`  | varchar(255) | PRI |                                 |
| `construct_name` | varchar(255) | MUL | FK → `construct.construct_name` |
| `description`    | text         |     |                                 |

**Sample:** `"Acceptance"` → construct `"Coping with COVID-19"`

---

### `instrument`

| Column              | Type         | Key | Notes    |
| ------------------- | ------------ | --- | -------- |
| `instrument_name`   | varchar(255) | PRI |          |
| `citation`          | text         |     |          |
| `translation`       | text         |     | nullable |
| `original_language` | varchar(10)  |     | nullable |
| `general_intro_de`  | text         |     | nullable |
| `general_intro_en`  | text         |     | nullable |
| `comment`           | text         |     | nullable |

---

### `instrument_construct`

| Column                    | Type         | Key | Notes                                       |
| ------------------------- | ------------ | --- | ------------------------------------------- |
| `instrument_construct_id` | int          | PRI | auto_increment                              |
| `instrument_name`         | varchar(255) | MUL | FK → `instrument.instrument_name`           |
| `construct_name`          | varchar(255) | MUL | FK → `construct.construct_name`             |
| `subfacet_name`           | varchar(255) | MUL | FK → `subfacet.subfacet_name`; **nullable** |

---

### `scale`

| Column       | Type         | Key             | Notes                                      |
| ------------ | ------------ | --------------- | ------------------------------------------ |
| `scale_name` | varchar(255) | PRI (composite) |                                            |
| `language`   | varchar(10)  | PRI (composite) |                                            |
| `scale_type` | enum         |                 | `ordinal`, `interval`, `text`, `selection` |

---

### `response_option`

| Column          | Type         | Key | Notes                   |
| --------------- | ------------ | --- | ----------------------- |
| `option_id`     | int          | PRI | auto_increment          |
| `scale_name`    | varchar(255) | MUL | FK → `scale.scale_name` |
| `language`      | varchar(10)  |     | FK → `scale.language`   |
| `label`         | varchar(255) |     | Human-readable label    |
| `numeric_value` | float        |     | nullable                |

---

### `instruction`

| Column           | Type         | Key             | Notes                         |
| ---------------- | ------------ | --------------- | ----------------------------- |
| `instruction_id` | varchar(255) | PRI (composite) |                               |
| `reference`      | varchar(255) | PRI (composite) | e.g. `"generally"`, `"diary"` |
| `language`       | varchar(2)   | PRI (composite) |                               |
| `text`           | text         |                 | nullable                      |

---

### `item`

Composite PK: `(item_name, item_language)`

| Column             | Type         | Key | Notes                                           |
| ------------------ | ------------ | --- | ----------------------------------------------- |
| `item_name`        | varchar(50)  | PRI |                                                 |
| `item_language`    | varchar(10)  | PRI | FK → `scale.language`                           |
| `instrument_name`  | varchar(255) | MUL | FK → `instrument.instrument_name`               |
| `scale_name`       | varchar(255) | MUL | FK → `scale.scale_name`                         |
| `instruction_text` | text         |     | nullable (inline override)                      |
| `instruction_id`   | varchar(255) |     | nullable                                        |
| `item_text`        | text         |     | NOT NULL                                        |
| `reverse_coded`    | tinyint(1)   |     | default 0; nullable                             |
| `data_type`        | enum         |     | `integer`, `float`, `string`, `boolean`, `date` |
| `subfacet_name`    | varchar(255) | MUL | FK → `subfacet.subfacet_name`; **nullable**     |

**Sample:** `aac_cog1` / `de` — instrument `"Awareness of Age-Related Changes Scale (AARC)"`, subfacet `"Positive Changes - Cognitive"`

> ⚠️ `subfacet_name` is nullable. Items without a subfacet cannot be joined through to `construct`/`topic` via the subfacet chain.

---

### `wave`

| Column  | Type        | Key | Notes             |
| ------- | ----------- | --- | ----------------- |
| `label` | varchar(50) | PRI | e.g. `T01`, `T06` |
| `month` | date        |     |                   |

---

### `item_wave`

| Column           | Type         | Key | Notes                                                               |
| ---------------- | ------------ | --- | ------------------------------------------------------------------- |
| `item_wave_id`   | varchar(50)  | PRI | e.g. `"T01_aac_cog1"`                                               |
| `item_name`      | varchar(50)  | MUL | FK → `item.item_name`                                               |
| `wave`           | varchar(50)  | MUL | FK → `wave.label`                                                   |
| `item_language`  | varchar(10)  |     | FK → `item.item_language`; **nullable in schema, non-null in data** |
| `instruction_id` | varchar(255) |     | nullable                                                            |
| `reference`      | varchar(255) |     | nullable; e.g. `"generally"`, `"diary"`                             |

Join to `item`: `item.item_name = item_wave.item_name AND item.item_language = item_wave.item_language`

---

### `participant`

| Column           | Type       | Key | Notes                                            |
| ---------------- | ---------- | --- | ------------------------------------------------ |
| `participant_id` | int        | PRI |                                                  |
| `sample`         | enum       |     | `Baseline`, `Refresher1`, `Refresher2`; nullable |
| `diary`          | tinyint(1) |     | nullable                                         |

---

### `participant_wave`

| Column                | Type        | Key | Notes                             |
| --------------------- | ----------- | --- | --------------------------------- |
| `participant_wave_id` | int         | PRI | auto_increment                    |
| `participant_id`      | int         | MUL | FK → `participant.participant_id` |
| `wave`                | varchar(50) | MUL | FK → `wave.label`                 |

---

### `response`

| Column           | Type        | Key | Notes                             |
| ---------------- | ----------- | --- | --------------------------------- |
| `response_id`    | int         | PRI | auto_increment                    |
| `participant_id` | int         | MUL | FK → `participant.participant_id` |
| `item_wave_id`   | varchar(50) | MUL | FK → `item_wave.item_wave_id`     |

17.8 M rows — the core data table linking participants to items per wave.

---

### `study`

| Column             | Type         | Key | Notes                         |
| ------------------ | ------------ | --- | ----------------------------- |
| `study_name`       | varchar(255) | PRI | e.g. `"D. Weiss et al. 2022"` |
| `title`            | varchar(255) |     | NOT NULL                      |
| `short_title`      | varchar(255) |     | NOT NULL                      |
| `doi`              | varchar(100) | UNI | nullable                      |
| `publication_year` | int          |     | nullable                      |
| `citation`         | text         |     | NOT NULL                      |
| `journal`          | varchar(255) |     | nullable                      |
| `comment`          | text         |     | nullable                      |

26 rows.

---

### `study_item_wave`

| Column          | Type         | Key | Notes                                                                                                |
| --------------- | ------------ | --- | ---------------------------------------------------------------------------------------------------- |
| `study_item_id` | int          | PRI | auto_increment                                                                                       |
| `study_name`    | varchar(255) | MUL | FK → `study.study_name`                                                                              |
| `item_wave_id`  | varchar(255) | MUL | FK → `item_wave.item_wave_id`                                                                        |
| `used_as`       | enum         |     | `Predictor`, `Outcome`, `Covariate`, `Moderator`, `Mediator`, `Dynamic Variable`, `Control Variable` |

**Sample:** study `"Zacher & Rudolph 2021a"` uses item-wave `"T01_life_sat"` as `Outcome`.

---

### `temp_instruction_wave`

Denormalised helper table (raw/derived, not for production queries).

| Column           | Type         | Key             |
| ---------------- | ------------ | --------------- |
| `item_language`  | varchar(2)   | PRI (composite) |
| `wave`           | varchar(10)  | PRI (composite) |
| `reference`      | varchar(255) | PRI (composite) |
| `instruction_id` | varchar(255) | PRI (composite) |
| `raw_instr`      | text         |                 |
| `text`           | text         |                 |

---

## Key relationships (ER summary)

```
topic
 └─ construct (topic_name FK)
     └─ subfacet (construct_name FK)
         └─ item.subfacet_name FK  ← nullable!

instrument
 └─ instrument_construct (instrument_name FK)
     ├─ construct_name FK
     └─ subfacet_name FK  ← nullable

scale ──────────────────── response_option (scale_name FK)
 └─ item (scale_name FK, item_language FK→scale.language)
     └─ item_wave (item_name FK, item_language FK)
         ├─ wave (wave FK)
         ├─ study_item_wave (item_wave_id FK)
         │   └─ study (study_name FK)
         └─ response (item_wave_id FK)
             └─ participant (participant_id FK)
                 └─ participant_wave (participant_id FK)

instruction (instruction_id + reference + language PK)
```

---

## Joining a study's questions through the hierarchy

```sql
-- Questions for a study, grouped by topic → construct → subfacet
SELECT DISTINCT
    t.topic_name,  t.description        AS topic_description,
    c.construct_name,  c.description    AS construct_description,
    s.subfacet_name,   s.description    AS subfacet_description,
    i.item_name,   i.item_language,     i.item_text,
    i.reverse_coded,   i.data_type
FROM study_item_wave siw
JOIN item_wave iw ON iw.item_wave_id = siw.item_wave_id
JOIN item      i  ON i.item_name     = iw.item_name
                 AND i.item_language = iw.item_language
JOIN subfacet  s  ON s.subfacet_name  = i.subfacet_name   -- excludes items with NULL subfacet
JOIN construct c  ON c.construct_name = s.construct_name
JOIN topic     t  ON t.topic_name     = c.topic_name
WHERE siw.study_name = ?
ORDER BY t.topic_name, c.construct_name, s.subfacet_name, i.item_name, i.item_language;
```

> Items where `subfacet_name IS NULL` are excluded by the inner join above.
> Use a LEFT JOIN chain if you need to capture those items too.
