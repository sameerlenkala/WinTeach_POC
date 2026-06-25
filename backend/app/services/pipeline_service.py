"""
WinTeach 5-Prompt Syllabus Pipeline

Prompt 1 — Extraction          : full structured JSON from PDF text
Prompt 2 — Bloom Mapping       : CO → Bloom level + quality (only when COs exist)
Prompt 3 — Industry & AI Skills: relevant skills from course content
Prompt 4 — CO Evaluation       : score weakness, rewrite ≥0.95, suggest 2-3 new COs
Prompt 4B — CO Generation      : generate COs from scratch when none exist in syllabus
Prompt 5 — CO–Unit Mapping     : map each final CO to the units that address it

Returns a PipelineResult dict that is stored in uploads.extraction_result under
the key "pipeline_result", alongside a compatible ai_extraction for the frontend.
"""

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

MODEL = "gpt-4o"

VALID_BLOOM = {"Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"}

# Bloom name/code → normalised label
# Handles: name variants ("Analyse"→"Analyze"), L-codes ("L4"→"Analyze"), mixed case
_BLOOM_NORM: dict[str, str] = {
    # Name variants
    "remember": "Remember",
    "understand": "Understand",
    "apply": "Apply",
    "analyse": "Analyze",
    "analyze": "Analyze",
    "evaluate": "Evaluate",
    "create": "Create",
    # L-code variants (GPT often returns these)
    "l1": "Remember",
    "l2": "Understand",
    "l3": "Apply",
    "l4": "Analyze",
    "l5": "Evaluate",
    "l6": "Create",
}


def _norm_bloom(raw: str) -> str:
    """Normalise any bloom representation to a valid VALID_BLOOM member."""
    return _BLOOM_NORM.get(raw.strip().lower(), "Understand")


def _chat(client: Any, prompt: str, system: str | None = None) -> dict:
    """Call GPT-4o with JSON mode and return parsed dict."""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    resp = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=4096,
        response_format={"type": "json_object"},
    )
    raw = resp.choices[0].message.content or "{}"
    return json.loads(raw)


# ── Prompt 1: Extraction ──────────────────────────────────────────────────────

_P1_SYSTEM = (
    "You are extracting structured information from an Indian university syllabus document. "
    "Output ONLY valid JSON — no markdown, no explanation."
)

_P1_TEMPLATE = """You are extracting structured information from an Indian university syllabus document.

Syllabus text:
{syllabus_text}

Extract the following fields. For each field assign a confidence level:
- High: field was clearly present in a labelled section or explicit table
- Low: field was inferred or derived (e.g. hours derived from credits)
- Missing: field was not found — return null for the value

━━━ FIELDS TO EXTRACT ━━━

1. module_tree
Extract all units and their topics and subtopics.

Rules:
- Each unit has a unit_id, a title, per-unit contact hours if shown in brackets, and a topics list
- Each topic has a title and a subtopics array (flat list of strings — never nest subtopics inside subtopics)
- Read the syllabus content carefully and use your understanding to identify what is a major topic
  and what is a subtopic within it. A topic is a significant concept or area that a lecturer would
  dedicate a portion of the class to. A subtopic is a more specific concept that falls under and
  supports a topic.
- When a syllabus lists sub-sections of the same broad concept (e.g. "File System Interface",
  "File system Implementation", "File-System Internals"), group them all under ONE topic (e.g.
  "File System") with each sub-section's items as subtopics. Only create separate topics when the
  concepts are genuinely distinct enough that a lecturer would teach them in separate sessions.
- If the syllabus does not provide an explicit name for the unit and only shows "UNIT – I" or "UNIT I"
  followed directly by topic content, set the unit title to "Unit I" (or Unit II, Unit III etc)
  — do not use the first topic as the unit title
- The unit title must NEVER be the same as a topic title inside that unit
- Every item from the syllabus must appear somewhere in the output — do not drop anything
- Maximum two levels only — topics and subtopics
- If per-unit contact hours are shown in brackets next to the unit title (e.g. UNIT – I (8 Hours))
  extract them as a contact_hours field on that unit

2. contact_hours
The overall lecture, tutorial, and practical hours for the whole course.
- Look for L/T/P table or notation like L:3 T:1 P:0 or 3-1-0 first
- If individual unit contact hours are shown in brackets next to unit titles
  (e.g. UNIT – I (10 Hours), UNIT – II (9 Hours)) add them all up — that sum
  is the most accurate total and should be used as the total
- If per-unit hours are NOT present then calculate total as (L + T) x 15 weeks
- Do not include P (practical) hours in the total
- Do not use C (credits) for calculating hours — C is credits not hours
- source should be "per_unit_sum" when summed from unit hours,
  "explicit_table" when from L/T/P table, "credits_derived" when derived

3. course_outcomes
The declared Course Outcomes or Learning Outcomes — not Course Objectives.
- Look for sections labelled: Course Outcomes, Learning Outcomes, CO, Students will be able to
- Extract each CO as a separate item with id and text
- CRITICAL: Course Objectives and Course Outcomes are different things
  Course Objectives are written from the teacher perspective ("To make students understand...")
  Course Outcomes are written from the student perspective ("Student will be able to apply...")
- If ONLY Course Objectives are found and NO Course Outcomes exist anywhere in the document:
  return an empty array, set confidence to missing, and set note to
  "Only Course Objectives found. No Course Outcomes declared. CO generation required for all units."
- Do NOT extract Course Objectives as Course Outcomes under any circumstances

4. course_objectives
The declared Course Objectives — not Course Outcomes.
- Look for sections labelled: Course Objectives, Objectives, Course Aims, Aim of the course
- Extract each objective as a separate item with id and text
- If no Course Objectives section exists return empty array with confidence missing
- Do NOT extract Course Outcomes as Course Objectives

5. textbooks
Books listed under the Textbooks or Text Books section only.
- Extract only books from sections explicitly labelled Textbooks or Text Books
- For each book extract: author, title, edition, publisher, year (null if not mentioned)
- year must be an integer if present, null if not mentioned
- If no Textbooks section exists return empty array with confidence missing

6. reference_books
Books listed under the Reference Books or References section only.
- Extract only books from sections explicitly labelled Reference Books or References
- Do NOT include textbooks here
- For each book extract: author, title, edition, publisher, year (null if not mentioned)
- year must be an integer if present, null if not mentioned
- If no Reference Books section exists return empty array with confidence missing

7. online_resources
Any online learning resources or URLs mentioned in the syllabus.
- Look for sections labelled: Online Learning Resources, Web Resources, e-Resources, URLs
- Extract each URL or resource as a separate string
- If none found return empty array with confidence missing

8. academic_year
The year and semester of study for this course.
- Look for patterns like "II Year II Semester", "III Year I Semester", "2nd Year", "First Year" in the document header
- Extract year as an integer (1, 2, 3, or 4) and semester as an integer (1 or 2)
- If not found return null for both

9. lab_flag
Whether this course has a laboratory or practical component.
- Return true only if the words laboratory, practical, lab, or experiment are explicitly present
- Otherwise return false

Also extract these top-level fields:
- course_name: string
- course_code: string
- credits: integer
- semester: string
- regulation: string

Output ONLY this JSON — no explanation, no markdown:
{{
  "course_name": "string",
  "course_code": "string",
  "credits": 3,
  "semester": "string",
  "regulation": "string",
  "module_tree": {{
    "value": [
      {{
        "unit_id": "UNIT-I",
        "title": "Unit title here",
        "contact_hours": 9,
        "topics": [
          {{
            "title": "Topic title",
            "subtopics": ["Subtopic 1", "Subtopic 2"]
          }}
        ]
      }}
    ],
    "confidence": "high|low|missing"
  }},
  "contact_hours": {{
    "value": {{"L": 3, "T": 0, "P": 0, "total": 45, "source": "per_unit_sum|explicit_table|credits_derived|inline_prose"}},
    "confidence": "high|low|missing"
  }},
  "course_outcomes": {{
    "value": [{{"id": "CO1", "text": "Full CO text here"}}],
    "confidence": "high|low|missing",
    "note": ""
  }},
  "course_objectives": {{
    "value": [{{"id": "OBJ1", "text": "Full objective text here"}}],
    "confidence": "high|low|missing"
  }},
  "textbooks": {{
    "value": [{{"author": "", "title": "", "edition": "", "publisher": "", "year": null}}],
    "confidence": "high|low|missing"
  }},
  "reference_books": {{
    "value": [{{"author": "", "title": "", "edition": "", "publisher": "", "year": null}}],
    "confidence": "high|low|missing"
  }},
  "online_resources": {{
    "value": ["https://example.com"],
    "confidence": "high|low|missing"
  }},
  "academic_year": {{
    "value": {{"year": 2, "semester": 2}},
    "confidence": "high|low|missing"
  }},
  "lab_flag": {{
    "value": false,
    "confidence": "high|low|missing"
  }}
}}"""


def _run_p1(client: Any, syllabus_text: str) -> dict:
    prompt = _P1_TEMPLATE.format(syllabus_text=syllabus_text[:12_000])
    return _chat(client, prompt, _P1_SYSTEM)


# ── Prompt 2: Bloom Mapping ───────────────────────────────────────────────────

_P2_TEMPLATE = """You are an expert in Bloom's Taxonomy applied to Indian university curriculum design.

Course Outcomes extracted from the syllabus:
{co_list}

Bloom's Taxonomy levels:
- L1 Remember:   Recalling facts, definitions, names
- L2 Understand: Explaining concepts, interpreting, summarising
- L3 Apply:      Using knowledge in new situations, solving, implementing
- L4 Analyse:    Breaking down, comparing, examining relationships
- L5 Evaluate:   Judging, justifying, critiquing, assessing quality
- L6 Create:     Designing, producing, formulating something new

For each Course Outcome:
1. Identify the primary action verb
2. Map it to the correct Bloom level based on what the verb actually demands cognitively
3. Assess CO quality — is it specific and measurable or vague and weak?
4. Give a brief justification

Output ONLY this JSON — no explanation, no markdown:
{{
  "bloom_mapping": [
    {{
      "co_id": "CO1",
      "co_text": "original CO text",
      "primary_verb": "the main action verb identified",
      "bloom_level": "L1|L2|L3|L4|L5|L6",
      "bloom_name": "Remember|Understand|Apply|Analyse|Evaluate|Create",
      "quality": "strong|acceptable|weak",
      "justification": "one sentence explaining the level and quality assessment"
    }}
  ]
}}"""


def _run_p2(client: Any, cos: list[dict]) -> dict:
    co_list = json.dumps([{"id": c["id"], "text": c["text"]} for c in cos], indent=2)
    return _chat(client, _P2_TEMPLATE.format(co_list=co_list))


# ── Prompt 3: Industry & AI Skills ───────────────────────────────────────────

_P3_TEMPLATE = """You are an industry curriculum expert who bridges university education and real-world job requirements.

Course content (topics by unit):
{course_content}

Course Outcomes:
{co_texts}

Based on current industry practices, job market demands, and emerging technology trends, identify industry skills that go BEYOND what is already taught in the syllabus above.

Rules:
1. ONLY suggest skills that are NOT already covered as a topic or subtopic in the course content above
2. Focus on real-world applications, tools, and practices that extend the course into industry or emerging technology
3. Include emerging AI-related skills where genuinely applicable to this subject area
4. Be specific to this course — avoid generic skills that apply to any engineering course
5. Think about what employers look for that fresh graduates typically lack
6. Suggest 2-4 skills maximum — quality over quantity

For each skill:
- Give the skill name and a one-line description of what industry practice it represents
- Map it to the most relevant topic(s) from the course that provide the foundation
- Tag the job roles that need this skill
- Indicate if it is a core industry skill, emerging AI-related, or transferable skill

Output ONLY this JSON — no explanation, no markdown:
{{
  "course_subject": "detected subject name",
  "industry_skills": [
    {{
      "skill_id": "S1",
      "skill_name": "skill name",
      "description": "one line description of what this skill involves",
      "relevant_topics": ["topic from course that builds this skill"],
      "job_roles": ["role 1", "role 2"],
      "category": "core_industry|emerging_ai|transferable"
    }}
  ],
  "summary": "one paragraph explaining the overall industry relevance of this course"
}}"""


def _run_p3(client: Any, module_tree: list[dict], co_texts: list[str]) -> dict:
    content_lines = []
    for u in module_tree:
        content_lines.append(f"Unit: {u.get('title', u.get('unit_id', ''))}")
        for t in u.get("topics", []):
            content_lines.append(f"  - {t['title']}")
            for s in t.get("subtopics", []):
                content_lines.append(f"    · {s}")
    course_content = "\n".join(content_lines)
    return _chat(client, _P3_TEMPLATE.format(
        course_content=course_content,
        co_texts=json.dumps(co_texts, indent=2),
    ))


# ── Prompt 4: CO Evaluation & Suggestion (has_cos = True) ────────────────────

_P4_TEMPLATE = """You are an expert curriculum designer for Indian engineering universities.

Existing Course Outcomes with quality assessment:
{co_with_bloom}

Course topics by unit:
{unit_topics}

Relevant industry skills for this course:
{skill_names}

━━━ TASK 1: EVALUATE AND SELECTIVELY REWRITE ━━━
For each CO assess its weakness on a scale of 0.0 to 1.0 where:
- 0.0 = perfectly strong, specific, measurable, appropriate Bloom level
- 1.0 = completely vague, unmeasurable, wrong level, or meaningless

ONLY rewrite COs where weakness_score >= 0.95
For all others keep the original text unchanged and mark action as "kept"

When rewriting:
- Use a precise action verb at an appropriate Bloom level for the course content
- Make it specific to actual topics in the course
- Write exactly 2 sentences — what the student does and what success looks like
- Do not use: understand, learn, know, appreciate, be familiar with, be aware of

━━━ TASK 2: SUGGEST ADDITIONAL INDUSTRY-ALIGNED COs ━━━
Suggest 2 to 3 additional Course Outcomes that:
- Are NOT already covered by the existing COs
- Are grounded in real industry requirements for this subject
- Include at least one CO that addresses emerging AI or modern technology applications if relevant
- Are at an appropriate Bloom level (L3 or above preferred)
- Each suggestion includes a Bloom level and justification

Output ONLY this JSON — no explanation, no markdown:
{{
  "evaluated_cos": [
    {{
      "co_id": "CO1",
      "original_text": "original CO text",
      "weakness_score": 0.0,
      "action": "kept|rewritten",
      "final_text": "final CO text — original if kept, rewritten if changed",
      "bloom_level": "L1|L2|L3|L4|L5|L6",
      "reason": "one sentence explaining the decision"
    }}
  ],
  "suggested_cos": [
    {{
      "suggested_id": "SUGG1",
      "text": "suggested CO text",
      "bloom_level": "L1|L2|L3|L4|L5|L6",
      "industry_relevance": "one sentence explaining why this CO matters for industry",
      "category": "core_industry|emerging_ai|advanced_application"
    }}
  ]
}}"""


def _run_p4(client: Any, co_with_bloom: list[dict], module_tree: list[dict], skill_names: list[str]) -> dict:
    unit_topics = []
    for u in module_tree:
        topics = ", ".join(t["title"] for t in u.get("topics", []))
        unit_topics.append(f"{u.get('title', u.get('unit_id', ''))}: {topics}")
    return _chat(client, _P4_TEMPLATE.format(
        co_with_bloom=json.dumps(co_with_bloom, indent=2),
        unit_topics="\n".join(unit_topics),
        skill_names=json.dumps(skill_names, indent=2),
    ))


# ── Prompt 4B: CO Generation (has_cos = False) ───────────────────────────────

_P4B_TEMPLATE = """You are an expert curriculum designer for Indian engineering universities.

This course has no declared Course Outcomes. You must generate appropriate Course Outcomes from scratch.

Course structure:
{unit_summaries}

Course Objectives declared in syllabus (teacher perspective, for reference only):
{obj_texts}

Relevant industry skills for this course:
{skill_names}

Academic year: Year {academic_year}, Semester {academic_semester}

━━━ TASK ━━━
Generate one Course Outcome per unit. Each CO must:
- Be written from the student perspective — what the student can do after completing the unit
- Use a precise, measurable action verb appropriate for the cognitive demand of the unit
- Be specific to the actual topics in that unit — not generic
- Be at an appropriate Bloom level for the course content and academic year
- Bloom level guidance by year:
  Year 1: mostly L2 (Understand) with some L3 (Apply) — foundational courses
  Year 2: mostly L3 (Apply) with some L4 (Analyse) — core technical courses
  Year 3: mostly L4 (Analyse) with some L5 (Evaluate) — advanced courses
  Year 4: L4 to L6 — specialised and project-oriented courses
- A course with lab component should have at least one CO at L3 or above
- Be assessable in an exam or assignment

Bloom level must reflect the academic year of the course:
- 1st year: prefer L1–L2. Students are being introduced to foundational concepts.
- 2nd year: prefer L2–L3. Students are building understanding and beginning to apply concepts.
- 3rd year: prefer L3–L4. Students are applying and analysing within their domain.
- 4th year: prefer L4–L6. Students are expected to analyse, evaluate, and create.
Do not mechanically escalate Bloom levels across units — each unit's level must reflect
what that unit's content genuinely demands at this academic level.

Additionally suggest 1-2 course-level COs that cut across multiple units and reflect industry relevance.

Bloom level verb guidance — choose based on what the unit genuinely demands:
- L2 Understand: summarise, classify, interpret, paraphrase
- L3 Apply:      apply, implement, solve, compute, demonstrate, construct
- L4 Analyse:    analyse, compare, examine, investigate, differentiate
- L5 Evaluate:   evaluate, justify, critique, assess
- L6 Create:     design, create, formulate, synthesise

Never use: understand, learn, know, appreciate, be aware of, explain, describe, list, state

Output ONLY this JSON — no explanation, no markdown:
{{
  "generated_cos": [
    {{
      "co_id": "CO1",
      "unit_id": "UNIT-I",
      "text": "CO text — 2 sentences. Sentence 1: what student does. Sentence 2: A student successfully achieving this outcome can [measurable demonstration].",
      "bloom_level": "L2|L3|L4|L5|L6",
      "bloom_name": "Understand|Apply|Analyse|Evaluate|Create",
      "action_verb": "verb used",
      "basis": "one sentence explaining what in this unit anchored this CO"
    }}
  ],
  "course_level_cos": [
    {{
      "co_id": "CL1",
      "text": "course-level CO text",
      "bloom_level": "L2|L3|L4|L5|L6",
      "bloom_name": "Understand|Apply|Analyse|Evaluate|Create",
      "industry_relevance": "one sentence on why this matters for industry",
      "units_covered": ["UNIT-I", "UNIT-II"]
    }}
  ]
}}"""


def _run_p4b(
    client: Any,
    module_tree: list[dict],
    obj_texts: list[str],
    skill_names: list[str],
    academic_year: int = 2,
    academic_semester: int = 1,
) -> dict:
    unit_summaries = []
    for u in module_tree:
        topics = ", ".join(t["title"] for t in u.get("topics", []))
        unit_summaries.append(f"{u.get('unit_id', '')}: {u.get('title', '')} — Topics: {topics}")
    return _chat(client, _P4B_TEMPLATE.format(
        unit_summaries="\n".join(unit_summaries),
        obj_texts=json.dumps(obj_texts, indent=2) if obj_texts else '"None declared"',
        skill_names=json.dumps(skill_names, indent=2) if skill_names else '"Not available"',
        academic_year=academic_year,
        academic_semester=academic_semester,
    ))


# ── Prompt 5: CO–Topic Mapping ───────────────────────────────────────────────

_P5_TEMPLATE = """You are an expert in curriculum alignment for Indian engineering universities.

Course topics extracted from the syllabus:
{topics_summary}

Final Course Outcomes:
{final_cos}

━━━ TASK ━━━
For each topic determine which Course Outcomes it contributes to.

Use your understanding of the subject matter to decide:
- Primary: this topic directly and substantially addresses the CO
- Supporting: this topic partially contributes to the CO but is not the main topic for it
- None: no meaningful relationship

Consider what students actually learn in each topic and what each CO requires them to be able to do.
A topic may contribute to multiple COs. A CO may be addressed by multiple topics.

IMPORTANT: COs with IDs starting with "CO" (e.g. CO1, CO2) are the evaluated course outcomes — these are the primary assessed outcomes of the course. COs with IDs starting with "SUGG" are supplementary suggested outcomes. Every topic MUST have at least one evaluated CO (CO1–CO4) listed as "primary". SUGG COs should be "supporting" only, never the sole primary CO for a topic.

Output ONLY this JSON — no explanation, no markdown:
{{
  "co_topic_mapping": [
    {{
      "unit_id": "UNIT-I",
      "unit_title": "unit title",
      "topic_title": "topic title",
      "mapped_cos": [
        {{
          "co_id": "CO1",
          "contribution": "primary|supporting",
          "reason": "one sentence explaining why this topic contributes to this CO"
        }}
      ]
    }}
  ],
  "co_coverage_summary": [
    {{
      "co_id": "CO1",
      "co_text": "CO text",
      "primary_topics": ["topic 1", "topic 2"],
      "supporting_topics": ["topic 3"],
      "coverage": "well_covered|partially_covered|not_covered"
    }}
  ]
}}"""


def _run_p5(client: Any, module_tree: list[dict], final_cos: list[dict]) -> dict:
    topics_summary = []
    for u in module_tree:
        for t in u.get("topics", []):
            topics_summary.append({
                "unit_id": u.get("unit_id", ""),
                "unit_title": u.get("title", ""),
                "topic_title": t["title"],
                "subtopics": t.get("subtopics", []),
            })
    return _chat(client, _P5_TEMPLATE.format(
        topics_summary=json.dumps(topics_summary, indent=2),
        final_cos=json.dumps(final_cos, indent=2),
    ))


# ── Convert P4B output → P4 format ───────────────────────────────────────────

def _p4b_to_p4_format(p4b: dict) -> dict:
    """Convert generated COs into the same evaluated_cos / suggested_cos schema as P4."""
    evaluated: list[dict] = []
    for co in p4b.get("generated_cos", []):
        evaluated.append({
            "co_id": co["co_id"],
            "original_text": co["text"],
            "weakness_score": 0.0,
            "action": "generated",
            "final_text": co["text"],
            "bloom_level": co.get("bloom_level", "L3"),
            "bloom_name": co.get("bloom_name", "Apply"),
            "reason": co.get("basis", "Generated from unit content"),
        })
    suggested: list[dict] = []
    for co in p4b.get("course_level_cos", []):
        suggested.append({
            "suggested_id": co["co_id"],
            "text": co["text"],
            "bloom_level": co.get("bloom_level", "L3"),
            "bloom_name": co.get("bloom_name", "Apply"),
            "industry_relevance": co.get("industry_relevance", ""),
            "category": "advanced_application",
        })
    return {"evaluated_cos": evaluated, "suggested_cos": suggested}


# ── Convert pipeline result → AIExtraction-compatible dict ───────────────────

def _to_ai_extraction(p1: dict, p4_result: dict, p5_result: dict | None = None) -> dict:
    """
    Build the ai_extraction dict that the frontend already knows how to consume.
    - Units come from p1 module_tree
    - COs come from p4 evaluated_cos (final_text + bloom)
    - Topic bloom_level is inherited from the primary CO mapped to that unit via P5
    """
    module_tree = p1.get("module_tree", {}).get("value") or []

    # Build CO bloom lookup: co_id → bloom_level (validated)
    co_bloom: dict[str, str] = {}
    for co in p4_result.get("evaluated_cos", []):
        bloom_raw = co.get("bloom_level", co.get("bloom_name", "Understand"))
        co_bloom[co["co_id"]] = _norm_bloom(bloom_raw)

    # Build per-topic primary CO mapping from P5: (unit_id, topic_title) → co_id
    # Also build co_number lookup: co_id → co_number (1-based)
    co_number_map: dict[str, int] = {}
    for i, co in enumerate(p4_result.get("evaluated_cos", []), 1):
        co_number_map[co["co_id"]] = i

    topic_co_map: dict[tuple[str, str], str] = {}  # (unit_id, topic_title) → co_id
    unit_primary_bloom: dict[str, str] = {}   # best bloom for unit fallback
    unit_supporting_bloom: dict[str, str] = {}  # fallback when no primary CO exists in unit
    if p5_result:
        for topic_entry in p5_result.get("co_topic_mapping", []):
            uid = topic_entry.get("unit_id", "")
            ttitle = topic_entry.get("topic_title", "")
            for mc in topic_entry.get("mapped_cos", []):
                co_id = mc.get("co_id", "")
                if co_id not in co_bloom:
                    continue
                if mc.get("contribution") == "primary":
                    topic_co_map[(uid, ttitle)] = co_id
                    if uid not in unit_primary_bloom:
                        unit_primary_bloom[uid] = co_bloom[co_id]
                    break
                if mc.get("contribution") == "supporting" and uid not in unit_supporting_bloom:
                    unit_supporting_bloom[uid] = co_bloom[co_id]

    units: list[dict] = []
    for i, u in enumerate(module_tree):
        unit_number = i + 1
        uid = u.get("unit_id", "")
        roman = uid.split("-")[-1].upper() if "-" in uid else uid.replace("UNIT", "").strip()
        roman_map = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
                     "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10}
        unit_number = roman_map.get(roman, unit_number)

        unit_fallback_bloom = unit_primary_bloom.get(uid, unit_supporting_bloom.get(uid, "Understand"))

        topics_out: list[dict] = []
        for t in u.get("topics", []):
            co_id = topic_co_map.get((uid, t["title"]))
            topic_bloom = co_bloom.get(co_id, unit_fallback_bloom) if co_id else unit_fallback_bloom
            co_num = co_number_map.get(co_id) if co_id else None
            entry: dict = {
                "title": t["title"],
                "bloom_level": topic_bloom,
                "subtopics": [{"title": s} for s in t.get("subtopics", [])],
            }
            if co_num is not None:
                entry["co_number"] = co_num
            topics_out.append(entry)
        units.append({
            "unit_number": unit_number,
            "title": u.get("title", ""),
            "hours": u.get("contact_hours", 0),
            "topics": topics_out,
        })

    # Build final COs from evaluated_cos with validated bloom
    cos_out: list[dict] = []
    num = 1
    for co in p4_result.get("evaluated_cos", []):
        bloom_raw = co.get("bloom_level", co.get("bloom_name", "Understand"))
        cos_out.append({
            "co_number": num,
            "text": co["final_text"],
            "bloom_level": _norm_bloom(bloom_raw),
        })
        num += 1

    ch = p1.get("contact_hours", {}).get("value") or {}
    ref_books_raw = p1.get("reference_books", {}).get("value") or []
    ref_books: list[str] = []
    for b in ref_books_raw:
        if isinstance(b, str):
            ref_books.append(b)
        elif isinstance(b, dict):
            parts = [b.get("author", ""), b.get("title", ""), b.get("edition", ""), b.get("publisher", "")]
            ref_books.append(", ".join(p for p in parts if p))

    return {
        "course_name": p1.get("course_name", ""),
        "course_code": p1.get("course_code", ""),
        "credits": p1.get("credits", 0),
        "semester": p1.get("semester", ""),
        "regulation": p1.get("regulation", ""),
        "total_hours": ch.get("total", 0) if isinstance(ch, dict) else 0,
        "lab_flag": p1.get("lab_flag", {}).get("value", False),
        "course_outcomes": cos_out,
        "units": units,
        "reference_books": ref_books,
    }


# ── Public API ────────────────────────────────────────────────────────────────

def run_pipeline(syllabus_text: str) -> dict:
    """
    Run the full 5-prompt pipeline on the syllabus text.

    Returns a dict with two keys:
      - "ai_extraction"  : AIExtraction-compatible dict (frontend-consumable)
      - "pipeline_result": full pipeline data (bloom_mapping, skills, suggestions, mapping)

    Returns None if OpenAI is unavailable.
    """
    try:
        from openai import OpenAI
        from app.core.config import settings

        if not settings.openai_api_key:
            logger.info("No OpenAI key — pipeline skipped")
            return {}

        client = OpenAI(api_key=settings.openai_api_key)

        # ── Prompt 1: Extraction ──────────────────────────────────────────────
        logger.info("Pipeline P1: extraction")
        p1 = _run_p1(client, syllabus_text)

        module_tree = p1.get("module_tree", {}).get("value") or []
        raw_cos = p1.get("course_outcomes", {}).get("value") or []
        co_note = p1.get("course_outcomes", {}).get("note", "") or ""
        obj_raw = p1.get("course_objectives", {}).get("value") or []

        ay = p1.get("academic_year", {}).get("value") or {}
        academic_year = int(ay.get("year") or 2)
        academic_semester = int(ay.get("semester") or 1)

        has_cos = bool(raw_cos) and "Only Course Objectives" not in co_note

        # ── Prompt 3: Industry skills (always runs) ───────────────────────────
        logger.info("Pipeline P3: industry skills")
        co_texts = [c["text"] for c in raw_cos] if has_cos else []
        p3 = _run_p3(client, module_tree, co_texts)
        skill_names = [s["skill_name"] for s in p3.get("industry_skills", [])[:5]]

        p2: dict = {}
        co_with_bloom: list[dict] = []

        if has_cos:
            # ── Prompt 2: Bloom mapping ───────────────────────────────────────
            logger.info("Pipeline P2: bloom mapping")
            p2 = _run_p2(client, raw_cos)
            bloom_by_id = {m["co_id"]: m for m in p2.get("bloom_mapping", [])}

            for co in raw_cos:
                bm = bloom_by_id.get(co["id"], {})
                co_with_bloom.append({
                    "id": co["id"],
                    "text": co["text"],
                    "bloom_level": bm.get("bloom_level", "unknown"),
                    "quality": bm.get("quality", "unknown"),
                    "justification": bm.get("justification", ""),
                })

            # ── Prompt 4: CO Evaluation & Suggestion ─────────────────────────
            logger.info("Pipeline P4: CO evaluation")
            p4 = _run_p4(client, co_with_bloom, module_tree, skill_names)

        else:
            # ── Prompt 4B: CO Generation ──────────────────────────────────────
            logger.info("Pipeline P4B: CO generation")
            obj_texts = [o["text"] for o in obj_raw]
            p4b = _run_p4b(client, module_tree, obj_texts, skill_names, academic_year, academic_semester)
            p4 = _p4b_to_p4_format(p4b)

        # ── Prompt 5: CO–Unit Mapping ─────────────────────────────────────────
        logger.info("Pipeline P5: CO–unit mapping")
        final_cos_for_p5 = [
            {"id": c["co_id"], "text": c["final_text"], "bloom_level": c.get("bloom_level", "L3")}
            for c in p4.get("evaluated_cos", [])
        ] + [
            {"id": s["suggested_id"], "text": s["text"], "bloom_level": s.get("bloom_level", "L3")}
            for s in p4.get("suggested_cos", [])
        ]
        p5 = _run_p5(client, module_tree, final_cos_for_p5)

        # ── Assemble result ───────────────────────────────────────────────────
        ai_extraction = _to_ai_extraction(p1, p4, p5)

        pipeline_result = {
            "p1_extraction": p1,
            "p2_bloom_mapping": p2,
            "p3_industry_skills": p3,
            "p4_co_evaluation": p4,
            "p5_co_topic_mapping": p5,
            "has_cos": has_cos,
            "academic_year": academic_year,
            "academic_semester": academic_semester,
        }

        logger.info(
            "Pipeline complete — %d units, %d final COs, %d suggestions",
            len(ai_extraction["units"]),
            len(ai_extraction["course_outcomes"]),
            len(p4.get("suggested_cos", [])),
        )

        return {
            "ai_extraction": ai_extraction,
            "pipeline_result": pipeline_result,
        }

    except Exception as e:
        logger.warning("Pipeline failed (%s): %s", type(e).__name__, e)
        return {}
