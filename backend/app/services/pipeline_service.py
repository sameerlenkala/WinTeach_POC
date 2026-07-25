"""
WinTeach 5-Prompt Syllabus Pipeline

Prompt 1 — Extraction          : full structured JSON from PDF text
Prompt 2 — Bloom Mapping       : CO → Bloom level + quality (only when COs exist)
Prompt 3 — Industry & AI Skills: relevant skills from course content
Prompt 4 — CO Evaluation       : score weakness, rewrite ≥0.95, suggest 2-3 Industry Outcomes (IOs)
Prompt 4B — CO Generation      : generate COs from scratch when none exist in syllabus
Prompt 5 — CO–Unit Mapping     : map each final CO to the units that address it

Returns a PipelineResult dict that is stored in uploads.extraction_result under
the key "pipeline_result", alongside a compatible ai_extraction for the frontend.
"""

import json
import logging
import time
from typing import Any

logger = logging.getLogger(__name__)

MODEL = "gpt-5.6-terra"   # offline fallback only — mirrors the settings.generation_model default

# Input cap for P1 — ~10k tokens. The old 12k-char cap (~3k tokens) silently
# dropped the later units of long syllabi on a 128k-context model.
P1_INPUT_CHAR_CAP = 40_000

_TRANSIENT_ERRORS = ("RateLimitError", "APITimeoutError", "APIConnectionError",
                     "InternalServerError", "APIError")


def _model() -> str:
    try:
        from app.core.config import settings
        return settings.generation_model
    except Exception:  # pragma: no cover
        return MODEL

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


_BLOOM_RANK = {"Remember": 1, "Understand": 2, "Apply": 3,
               "Analyze": 4, "Evaluate": 5, "Create": 6}


def _chat(client: Any, prompt: str, system: str | None = None,
          max_tokens: int = 16000) -> dict:
    """One JSON-mode chat call with the same failure handling as the generation
    service: transient API errors retry with backoff; invalid JSON retries with
    the parse error fed back; a truncated response (finish_reason=length — the
    old 4096 cap silently truncated P1's module tree on dense syllabi) is told
    to compress prose rather than the structure."""
    base = []
    if system:
        base.append({"role": "system", "content": system})
    base.append({"role": "user", "content": prompt})

    from app.services import llm_compat
    messages = list(base)
    last_err: Exception | None = None
    api_retries = 0
    for attempt in range(3):
        try:
            resp = llm_compat.create_chat_completion(
                client, model=_model(),
                messages=messages,
                temperature=0.2,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
        except Exception as e:
            if type(e).__name__ in _TRANSIENT_ERRORS and api_retries < 2:
                api_retries += 1
                logger.warning("pipeline _chat transient error (%s), retry %d",
                               type(e).__name__, api_retries)
                time.sleep(2 * api_retries)
                continue
            raise
        choice = resp.choices[0]
        raw = choice.message.content or "{}"
        finish = getattr(choice, "finish_reason", None)
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            last_err = e
            logger.warning("pipeline _chat invalid JSON (attempt %d, finish_reason=%s): %s",
                           attempt + 1, finish, e)
            if finish == "length":
                note = ("Your previous response was cut off before the JSON completed. "
                        "Re-emit the COMPLETE JSON object, compressing prose fields "
                        "enough to fit — never truncate the structure itself.")
            else:
                note = (f"Your previous response was not valid JSON (parse error: {e}). "
                        "Re-emit the COMPLETE, corrected JSON object — nothing else.")
            messages = base + [
                {"role": "assistant", "content": raw[:6000]},
                {"role": "user", "content": note},
            ]
    raise last_err


# ── Prompt 1: Extraction ──────────────────────────────────────────────────────
#
# Two focused extractions run in parallel: the module tree comes from the
# atomize-then-cluster engine in structure_extraction.py (v2 — the model only
# groups deterministic phrase atoms, so duplicated/dropped/paraphrased content
# is structurally impossible); P1-META extracts everything else below.

_P1_SYSTEM = (
    "You are extracting structured information from an Indian university syllabus document. "
    "Output ONLY valid JSON — no markdown, no explanation."
)

_P1_META_TEMPLATE = """You are extracting course metadata from an Indian university syllabus document.
(The unit/topic structure is extracted separately — do NOT output a module tree.)

Syllabus text:
{syllabus_text}

Extract the following fields. For each field assign a confidence level:
- High: field was clearly present in a labelled section or explicit table
- Low: field was inferred or derived (e.g. hours derived from credits)
- Missing: field was not found — return null for the value

━━━ FIELDS TO EXTRACT ━━━

1. contact_hours
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

2. course_outcomes
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

3. course_objectives
The declared Course Objectives — not Course Outcomes.
- Look for sections labelled: Course Objectives, Objectives, Course Aims, Aim of the course
- Extract each objective as a separate item with id and text
- If no Course Objectives section exists return empty array with confidence missing
- Do NOT extract Course Outcomes as Course Objectives

4. textbooks
Books listed under the Textbooks or Text Books section only.
- Extract only books from sections explicitly labelled Textbooks or Text Books
- For each book extract: author, title, edition, publisher, year (null if not mentioned)
- year must be an integer if present, null if not mentioned
- If no Textbooks section exists return empty array with confidence missing

5. reference_books
Books listed under the Reference Books or References section only.
- Extract only books from sections explicitly labelled Reference Books or References
- Do NOT include textbooks here
- For each book extract: author, title, edition, publisher, year (null if not mentioned)
- year must be an integer if present, null if not mentioned
- If no Reference Books section exists return empty array with confidence missing

6. online_resources
Any online learning resources or URLs mentioned in the syllabus.
- Look for sections labelled: Online Learning Resources, Web Resources, e-Resources, URLs
- Extract each URL or resource as a separate string
- If none found return empty array with confidence missing

7. academic_year
The year and semester of study for this course.
- Look for patterns like "II Year II Semester", "III Year I Semester", "2nd Year", "First Year" in the document header
- Extract year as an integer (1, 2, 3, or 4) and semester as an integer (1 or 2)
- If not found return null for both

8. lab_flag
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
    """Structure (atomize-then-cluster engine) + metadata (one focused call),
    run in parallel and merged into the single p1 dict shape every downstream
    consumer already reads."""
    from app.services import structure_extraction
    text = syllabus_text[:P1_INPUT_CHAR_CAP]
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=2) as pool:
        f_struct = pool.submit(structure_extraction.extract_module_tree,
                               client, text, _chat)
        f_meta = pool.submit(_chat, client,
                             _P1_META_TEMPLATE.format(syllabus_text=text),
                             _P1_SYSTEM)
        tree = f_struct.result()
        meta = f_meta.result()
    meta["module_tree"] = tree if isinstance(tree, dict) else {"value": [], "confidence": "missing"}
    return meta


# ── Prompt 2: Bloom Mapping ───────────────────────────────────────────────────

_P2_TEMPLATE = """You are an expert in Bloom's Revised Taxonomy applied to Outcome-Based Education
in Indian engineering universities. Classify each Course Outcome below.

Course Outcomes extracted from the syllabus:
{co_list}

Bloom's Taxonomy levels:
- L1 Remember:   recall facts — list, define, state, name, identify
- L2 Understand: explain, describe, classify, summarise, illustrate, discuss
- L3 Apply:      use in new situations — solve, implement, compute, construct, demonstrate (by doing)
- L4 Analyse:    break down, compare, differentiate, debug, examine relationships
- L5 Evaluate:   judge against criteria — justify, critique, assess, recommend
- L6 Create:     produce something new — design, formulate, develop, architect

━━━ CLASSIFICATION RULES ━━━
1. Judge the COGNITIVE WORK the student must be assessed on — never the verb
   keyword alone. "Write programs to implement stack operations" is L3 (the work
   is applying), even though "write" is not a canonical L3 verb. "Explain the
   design of the TCP/IP stack" is L2 (the work is explaining), even though the
   word "design" appears in it.
2. Multi-verb COs ("understand and apply X", "study and analyse Y"): classify at
   the HIGHEST level the CO genuinely assesses, and report that operative verb
   as primary_verb. Ignore filler verbs.
3. Calibration examples:
   - "Demonstrate the working of AVL trees" → L2 if it means explain/trace on
     paper; L3 if it means implement/perform. Decide from the CO's own wording
     and the course context — theory courses lean L2, programming/lab courses L3.
   - "Understand normalisation and apply it to schema design" → L3 (apply wins).
   - "Discuss various indexing techniques" → L2.
   - "Compare shortest-path algorithms for a given road network" → L4.
   - "Design a normalized database schema for an enterprise scenario" → L6.
4. QUALITY — judge assessability:
   - strong: one clear measurable action verb + specific course content + an
     examiner could set a question testing exactly this.
   - acceptable: measurable but broad or compound; assessable with some
     interpretation.
   - weak: unmeasurable verb (understand, know, learn, appreciate, be familiar
     with, be aware of), no specific content, or not assessable as written.

Output ONLY this JSON — one entry per CO, same order, no explanation, no markdown:
{{
  "bloom_mapping": [
    {{
      "co_id": "CO1",
      "co_text": "original CO text",
      "primary_verb": "the operative action verb",
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

Rewrite a CO when its quality assessment above is "weak" OR its weakness_score
is 0.7 or higher — a vague, unmeasurable, or banned-verb CO must not survive
just because it is not completely meaningless.
For all others keep the original text unchanged and mark action as "kept"

When rewriting:
- Use a precise action verb at an appropriate Bloom level for the course content
- Make it specific to actual topics in the course
- Write ONE concise sentence — a single measurable action statement. Never append
  a "success looks like" sentence to the CO text; that belongs in success_criteria.
- Do not use: understand, learn, know, appreciate, be familiar with, be aware of

━━━ TASK 2: SUGGEST ADDITIONAL INDUSTRY OUTCOMES (IOs) ━━━
Suggest 2 to 3 Industry Outcomes — supplementary outcomes that:
- Are NOT already covered by the existing COs
- Are grounded in real industry requirements for this subject
- Include at least one IO that addresses emerging AI or modern technology applications if relevant
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
      "final_text": "final CO text — ONE sentence, original if kept, rewritten if changed",
      "success_criteria": "one sentence: the measurable demonstration of success (empty string when kept)",
      "bloom_level": "L1|L2|L3|L4|L5|L6",
      "reason": "one sentence explaining the decision"
    }}
  ],
  "suggested_cos": [
    {{
      "suggested_id": "IO1",
      "text": "Industry Outcome text — ONE sentence",
      "bloom_level": "L1|L2|L3|L4|L5|L6",
      "industry_relevance": "one sentence explaining why this IO matters for industry",
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

Additionally suggest 1-2 Industry Outcomes (IOs) — course-level outcomes that cut
across multiple units and reflect industry relevance.

Bloom level verb guidance — choose based on what the unit genuinely demands:
- L2 Understand: summarise, classify, interpret, paraphrase
- L3 Apply:      apply, implement, solve, compute, demonstrate, construct
- L4 Analyse:    analyse, compare, examine, investigate, differentiate
- L5 Evaluate:   evaluate, justify, critique, assess
- L6 Create:     design, create, formulate, synthesise

Never use the unmeasurable verbs: understand, learn, know, appreciate, be familiar
with, be aware of, study, grasp. (Measurable L1/L2 verbs like explain, describe,
classify, summarise ARE allowed where a unit genuinely sits at that level.)

Output ONLY this JSON — no explanation, no markdown:
{{
  "generated_cos": [
    {{
      "co_id": "CO1",
      "unit_id": "UNIT-I",
      "text": "CO text — ONE concise sentence stating what the student can do. Never append a success-criteria sentence here.",
      "success_criteria": "one sentence: A student successfully achieving this outcome can [measurable demonstration].",
      "bloom_level": "L2|L3|L4|L5|L6",
      "bloom_name": "Understand|Apply|Analyse|Evaluate|Create",
      "action_verb": "verb used",
      "basis": "one sentence explaining what in this unit anchored this CO"
    }}
  ],
  "course_level_cos": [
    {{
      "co_id": "IO1",
      "text": "Industry Outcome text — ONE sentence",
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

_P5_TEMPLATE = """You are an expert in OBE curriculum alignment for Indian engineering universities.
Map every topic to the Course Outcomes it serves, and judge the Bloom level each
topic is actually TAUGHT at.

Course topics extracted from the syllabus:
{topics_summary}

Final Course Outcomes — each carries its Bloom level; USE the levels, they are
authoritative:
{final_cos}

━━━ TASK 1: CO MAPPING PER TOPIC ━━━
For each topic decide which COs it contributes to:
- primary: the ONE evaluated CO (id starting "CO") this topic most directly
  serves. TWO tests, and both must hold:
    (a) subject-matter fit — the CO's content is what this topic teaches;
    (b) cognitive fit — this topic gives students the material to perform the
        CO's verb at its level. A topic that only introduces definitions cannot
        be the vehicle for a design-level CO. When two COs fit the content
        equally, choose on cognitive fit — never on CO order.
- supporting: COs the topic partially feeds.
- Every topic MUST have exactly one primary evaluated CO. Outcomes with IDs
  starting "IO" are Industry Outcomes — supplementary, supporting only, never
  the sole primary.
- A topic may serve multiple COs; a CO may be served by multiple topics.

━━━ TASK 2: TOPIC BLOOM LEVEL ━━━
For each topic also output topic_bloom — the cognitive level THIS topic's
teaching genuinely reaches, judged from its own subtopics:
- survey / definitional / terminology / history topics → L1–L2
- mechanism, working-principle, protocol, single-technique topics → L2–L3
- problem-solving, implementation, query-writing, derivation topics → L3
- comparison, trade-off, performance-analysis topics → L4
- design, architecture, synthesis, open-ended-project topics → L5–L6
Constraints:
- topic_bloom NEVER exceeds the primary CO's Bloom level.
- Topics under the SAME CO need NOT share a level — an introductory topic under
  an L4 CO is still L2. Copying the CO's level onto every topic it covers is the
  exact failure you exist to prevent.

━━━ TASK 3: COVERAGE SUMMARY ━━━
For each CO summarise which topics serve it and how well it is covered.

Output ONLY this JSON — no explanation, no markdown:
{{
  "co_topic_mapping": [
    {{
      "unit_id": "UNIT-I",
      "unit_title": "unit title",
      "topic_title": "topic title",
      "topic_bloom": "L1|L2|L3|L4|L5|L6",
      "mapped_cos": [
        {{
          "co_id": "CO1",
          "contribution": "primary|supporting",
          "reason": "one sentence covering BOTH the subject fit and the cognitive fit"
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


# ── P5 coverage repair ────────────────────────────────────────────────────────
# Closes two observed mapping gaps: topics left without a primary evaluated CO
# (their bloom falls back to an unrelated CO's level) and COs mapped to no
# topic (they silently drop out of coverage). Best-effort: failures leave the
# original mapping untouched.

_P5_REPAIR_TEMPLATE = """You are fixing gaps in a CO–topic mapping for an Indian engineering course.
Close BOTH kinds of gaps below using genuine subject-matter fit — never invent COs or topics.

━━━ COURSE OUTCOMES ━━━
{cos}

━━━ ALL TOPICS (unit_id / topic_title) ━━━
{topics}

━━━ GAP 1: TOPICS MISSING A PRIMARY EVALUATED CO ━━━
Every topic must have the single best-fitting evaluated CO (id starting "CO") as primary.
Pick on BOTH subject-matter fit and cognitive fit — the CO Bloom levels are shown above;
prefer the CO whose level matches how the topic is actually taught.
{uncovered_topics}

━━━ GAP 2: COs MAPPED TO NO TOPIC ━━━
Map each to the topic(s) that genuinely serve it — primary if the topic substantially
addresses it, else supporting. If truly NO topic covers a CO, list its id in
"unmappable_cos" instead of forcing a bad mapping.
{orphaned_cos}

Output ONLY this JSON — no explanation, no markdown. Use the exact unit_id, topic_title,
and CO ids from the lists above:
{{
  "topic_fixes": [
    {{"unit_id": "unit id from the list", "topic_title": "exact topic title",
      "primary_co": "an evaluated CO id", "reason": "one sentence"}}
  ],
  "co_fixes": [
    {{"co_id": "an unmapped CO id", "assignments": [
      {{"unit_id": "unit id", "topic_title": "exact topic title", "contribution": "primary|supporting"}}
    ]}}
  ],
  "unmappable_cos": []
}}"""


def _p5_gaps(p5: dict, topics: list[dict], cos: list[dict]) -> tuple[list[dict], list[dict]]:
    """(topics missing a primary evaluated CO, COs mapped to no topic)."""
    entry_by_key = {(e.get("unit_id", ""), e.get("topic_title", "")): e
                    for e in p5.get("co_topic_mapping", [])}
    uncovered = []
    for t in topics:
        e = entry_by_key.get((t.get("unit_id", ""), t.get("topic_title", "")))
        mapped = (e or {}).get("mapped_cos", [])
        if not any(m.get("contribution") == "primary" and str(m.get("co_id", "")).startswith("CO")
                   for m in mapped):
            uncovered.append(t)
    mapped_ids = {m.get("co_id") for e in p5.get("co_topic_mapping", []) for m in e.get("mapped_cos", [])}
    orphaned = [c for c in cos if c.get("id") not in mapped_ids]
    return uncovered, orphaned


def _rebuild_coverage_summary(p5: dict, cos: list[dict]) -> None:
    """Recompute co_coverage_summary deterministically from the mapping."""
    primary: dict[str, list[str]] = {}
    supporting: dict[str, list[str]] = {}
    for e in p5.get("co_topic_mapping", []):
        for m in e.get("mapped_cos", []):
            bucket = primary if m.get("contribution") == "primary" else supporting
            bucket.setdefault(m.get("co_id", ""), []).append(e.get("topic_title", ""))
    p5["co_coverage_summary"] = [{
        "co_id": c["id"],
        "co_text": c.get("text", ""),
        "primary_topics": primary.get(c["id"], []),
        "supporting_topics": supporting.get(c["id"], []),
        "coverage": ("well_covered" if primary.get(c["id"])
                     else "partially_covered" if supporting.get(c["id"]) else "not_covered"),
    } for c in cos]


def repair_p5_coverage(client: Any, p5: dict, topics: list[dict], cos: list[dict]) -> dict:
    """One LLM repair pass closing coverage gaps, then a deterministic summary
    rebuild. `topics` is [{unit_id, unit_title, topic_title}] — callers may pass
    syllabus topics (pipeline) or DB topics including elective units (backfill)."""
    try:
        uncovered, orphaned = _p5_gaps(p5, topics, cos)
        if not uncovered and not orphaned:
            _rebuild_coverage_summary(p5, cos)
            return p5

        result = _chat(client, _P5_REPAIR_TEMPLATE.format(
            cos=json.dumps(cos, indent=2),
            topics=json.dumps(topics, indent=2),
            uncovered_topics=json.dumps(uncovered, indent=2) if uncovered else "None",
            orphaned_cos=json.dumps(orphaned, indent=2) if orphaned else "None",
        ))

        valid_cos = {c["id"] for c in cos}
        entry_by_key = {(e.get("unit_id", ""), e.get("topic_title", "")): e
                        for e in p5.setdefault("co_topic_mapping", [])}

        def entry_for(unit_id: str, topic_title: str) -> dict | None:
            e = entry_by_key.get((unit_id, topic_title))
            if e is None:
                # Topic exists (e.g. elective unit) but had no mapping row yet.
                known = next((t for t in topics if t.get("unit_id") == unit_id
                              and t.get("topic_title") == topic_title), None)
                if known is None:
                    return None
                e = {"unit_id": unit_id, "unit_title": known.get("unit_title", ""),
                     "topic_title": topic_title, "mapped_cos": []}
                p5["co_topic_mapping"].append(e)
                entry_by_key[(unit_id, topic_title)] = e
            return e

        for fix in result.get("topic_fixes", []) or []:
            co_id = fix.get("primary_co")
            if co_id not in valid_cos or not str(co_id).startswith("CO"):
                continue
            e = entry_for(fix.get("unit_id", ""), fix.get("topic_title", ""))
            if e is None:
                continue
            existing = next((m for m in e["mapped_cos"] if m.get("co_id") == co_id), None)
            if existing:
                existing["contribution"] = "primary"
            else:
                e["mapped_cos"].append({"co_id": co_id, "contribution": "primary",
                                        "reason": fix.get("reason", "coverage repair")})

        for fix in result.get("co_fixes", []) or []:
            co_id = fix.get("co_id")
            if co_id not in valid_cos:
                continue
            for a in fix.get("assignments", []) or []:
                e = entry_for(a.get("unit_id", ""), a.get("topic_title", ""))
                if e is None or any(m.get("co_id") == co_id for m in e["mapped_cos"]):
                    continue
                contribution = a.get("contribution") if a.get("contribution") in ("primary", "supporting") else "supporting"
                e["mapped_cos"].append({"co_id": co_id, "contribution": contribution,
                                        "reason": "coverage repair"})

        if result.get("unmappable_cos"):
            logger.warning("P5 repair: COs with no covering topic: %s", result["unmappable_cos"])
        _rebuild_coverage_summary(p5, cos)
    except Exception:
        logger.warning("P5 coverage repair failed — keeping original mapping", exc_info=True)
    return p5


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
            "success_criteria": co.get("success_criteria", ""),
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

def derive_unit_hours(units: list[dict], *, total_hours: float | int = 0,
                      credits: float | int = 0) -> None:
    """Fill in lecture hours for units the syllabus left silent (hours <= 0),
    in priority order: (1) explicitly stated per-unit hours are never touched;
    (2) the course-level contact-hours total (L-T-P parse / per-unit sum /
    (L+T)×15 weeks from P1-META) minus the explicitly-known hours, split
    evenly across the remaining units; (3) credits × 15 weeks when no total is
    known. Values are rounded to half-hours and clamped to 2–15; when nothing
    is derivable, hours stay 0 and generation's safety-net default applies.
    Mutates `units` in place."""
    missing = [u for u in units if float(u.get("hours") or 0) <= 0]
    if not missing:
        return
    known = sum(float(u.get("hours") or 0) for u in units if float(u.get("hours") or 0) > 0)
    pool = 0.0
    if total_hours and float(total_hours) > known:
        pool = float(total_hours) - known
    elif credits and float(credits) > 0 and not total_hours:
        pool = float(credits) * 15.0
    if pool <= 0:
        return
    share = pool / len(missing)
    share = round(share * 2) / 2                    # half-hour steps
    share = max(2.0, min(15.0, share))              # sane band, not one institution's 8-10
    for u in missing:
        u["hours"] = share


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
    topic_bloom_map: dict[tuple[str, str], str] = {}  # P5's per-topic taught level
    unit_primary_bloom: dict[str, str] = {}   # best bloom for unit fallback
    unit_supporting_bloom: dict[str, str] = {}  # fallback when no primary CO exists in unit
    if p5_result:
        for topic_entry in p5_result.get("co_topic_mapping", []):
            uid = topic_entry.get("unit_id", "")
            ttitle = topic_entry.get("topic_title", "")
            if topic_entry.get("topic_bloom"):
                topic_bloom_map[(uid, ttitle)] = _norm_bloom(str(topic_entry["topic_bloom"]))
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
            # Ceiling = the primary CO's Bloom (unit fallback when unmapped).
            ceiling = co_bloom.get(co_id, unit_fallback_bloom) if co_id else unit_fallback_bloom
            # P5's per-topic taught level wins when present — an introductory
            # topic under an L4 CO stays L2 instead of inheriting L4 wholesale —
            # but never above the ceiling.
            declared = topic_bloom_map.get((uid, t["title"]))
            if declared and _BLOOM_RANK.get(declared, 6) <= _BLOOM_RANK.get(ceiling, 6):
                topic_bloom = declared
            else:
                topic_bloom = ceiling
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

    # Units whose hours the syllabus didn't state get a derived value here, so
    # units.hours stops being 0 and the whole downstream chain (topic plan
    # minutes → notes/slide budgets) runs on real allocations.
    derive_unit_hours(units,
                      total_hours=ch.get("total", 0) if isinstance(ch, dict) else 0,
                      credits=p1.get("credits", 0))

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

        # ── Prompts 2 + 3 in parallel (both depend only on P1) ────────────────
        logger.info("Pipeline P2+P3: bloom mapping + industry skills")
        co_texts = [c["text"] for c in raw_cos] if has_cos else []
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=2) as pool:
            f3 = pool.submit(_run_p3, client, module_tree, co_texts)
            f2 = pool.submit(_run_p2, client, raw_cos) if has_cos else None
            p3 = f3.result()
            p2 = f2.result() if f2 is not None else {}
        skill_names = [s["skill_name"] for s in p3.get("industry_skills", [])[:5]]

        co_with_bloom: list[dict] = []

        if has_cos:
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

        # Coverage repair: every topic gets a primary evaluated CO; every CO
        # lands on ≥1 topic (or is flagged unmappable) — see repair_p5_coverage.
        all_topics = [{"unit_id": u.get("unit_id", ""), "unit_title": u.get("title", ""),
                       "topic_title": t["title"]}
                      for u in module_tree for t in u.get("topics", [])]
        p5 = repair_p5_coverage(client, p5, all_topics, final_cos_for_p5)

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
