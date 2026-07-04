// Read-only Topic Plan panel for the generation studio — renders every section
// the plan prompt produces (companion: Topic Plan spec doc). Collapsed by
// default; each section is guarded on presence so older plans render whatever
// they have.
import { useState } from 'react';
import { W } from './winteachStyles';
import { Badge } from './WinTeachUI';

const th: React.CSSProperties = {
  textAlign: 'left', padding: '7px 12px', background: W.surfaceMuted,
  borderBottom: `1px solid ${W.border}`, fontFamily: W.fontDisplay, fontWeight: 600,
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: W.text3,
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '8px 12px', borderBottom: `1px solid ${W.border}`, color: W.text2,
  fontSize: 12.5, lineHeight: 1.5, verticalAlign: 'top',
};

function PlanSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', color: W.text3, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function bloomBadge(lvl?: string) {
  return lvl ? <Badge variant="blue">{lvl}</Badge> : null;
}

export function TopicPlanPanel({ plan }: { plan: any }) {
  const [open, setOpen] = useState(false);
  if (!plan) return null;

  const hero = plan.hero_block ?? {};
  const cos: any[] = plan.co_mapping ?? [];
  const tlos: any[] = plan.tlo_set ?? [];
  const prereqs: any[] = plan.prerequisite_boundary ?? [];
  const hours = plan.hour_allocation_blueprint;
  const sessions: any[] = plan.session_plan ?? [];
  const resources = plan.resource_hub;
  const assess = plan.assessment_blueprint;
  const gate = plan.compliance_gate;
  const conceptName = (cid: string) =>
    (plan.concept_inventory ?? []).find((c: any) => c.concept_id === cid)?.concept_name ?? cid;
  const gatePassed = gate?.outcome === 'PASS';

  const hourChips = hours ? ([
    ['Lecture', hours.lecture_hours], ['Tutorial', hours.tutorial_hours],
    ['Self-study', hours.self_study_hours], ['Assessment', hours.assessment_hours],
  ] as [string, any][]).filter(([, v]) => v != null) : [];

  const GATE_LABELS: Record<string, string> = {
    tlo_verbs_testable: 'TLO verbs testable',
    hours_reconciled: 'Hours reconciled',
    session_minutes_reconciled: 'Session minutes reconciled',
    prerequisites_mapped: 'Prerequisites mapped',
    tlo_subtopic_bidirectional: 'TLO ↔ subtopic bidirectional',
    bloom_ceiling_respected: 'Bloom ceiling respected',
  };

  return (
    <div style={{
      background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 10,
      boxShadow: W.shadowCard, marginBottom: 14, overflow: 'hidden',
    }}>
      {/* header / toggle */}
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
        padding: '12px 16px', border: 'none', cursor: 'pointer',
        background: open ? W.surfaceMuted : 'transparent',
      }}>
        <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text }}>Topic plan</span>
        {hero.bloom_ceiling && <Badge variant="muted">Ceiling {hero.bloom_ceiling}</Badge>}
        {hero.total_hours != null && <Badge variant="muted">{hero.total_hours} hrs</Badge>}
        {gate && (gatePassed
          ? <Badge variant="green" dot>Compliance PASS</Badge>
          : <Badge variant="orange">Compliance {gate.outcome ?? '—'}</Badge>)}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: W.brandTintFg, fontFamily: W.fontDisplay, fontWeight: 600 }}>
          {open ? '▾ Hide details' : '▸ Show details'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '16px 16px 6px', borderTop: `1px solid ${W.border}` }}>

          {/* hero block */}
          {(hero.program_year_sem || hero.unit_identifier || hero.obe_framework) && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: W.text3, marginBottom: 18 }}>
              {hero.program_year_sem && <span>{hero.program_year_sem}</span>}
              {hero.course_code_title && <span>{hero.course_code_title}</span>}
              {hero.unit_identifier && <span>{hero.unit_identifier}</span>}
              {hero.obe_framework && <span>{hero.obe_framework}</span>}
            </div>
          )}

          {/* CO mapping */}
          {cos.length > 0 && (
            <PlanSection title="Course outcome mapping">
              <div style={{ overflowX: 'auto', border: `1px solid ${W.border}`, borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={th}>CO</th><th style={th}>Statement</th><th style={th}>Bloom</th>
                    <th style={th}>Contribution</th><th style={th}>Weight</th><th style={th}>Why this topic</th>
                  </tr></thead>
                  <tbody>
                    {cos.map((m: any, i: number) => (
                      <tr key={i}>
                        <td style={{ ...td, fontWeight: 600, color: W.text, whiteSpace: 'nowrap' }}>{m.co_id}</td>
                        <td style={td}>{m.co_statement}</td>
                        <td style={td}>{bloomBadge(m.bloom_level)}</td>
                        <td style={td}>{m.contribution_level ?? '—'}</td>
                        <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>{m.topic_weight_pct != null ? `${m.topic_weight_pct}%` : '—'}</td>
                        <td style={td}>{m.alignment_justification ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PlanSection>
          )}

          {/* TLO directory */}
          {tlos.length > 0 && (
            <PlanSection title={`Learning outcomes (${tlos.length} TLOs)`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {tlos.map((t: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 12.5, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: W.text3, fontVariantNumeric: 'tabular-nums', flexShrink: 0, width: 26 }}>{t.tlo_id}</span>
                    {bloomBadge(t.bloom_level)}
                    <span style={{ color: W.text2, flex: 1 }}>{t.statement}</span>
                    {t.parent_co && <span style={{ fontSize: 11, color: W.text3, flexShrink: 0 }}>→ {t.parent_co}</span>}
                  </div>
                ))}
              </div>
            </PlanSection>
          )}

          {/* prerequisites */}
          {prereqs.length > 0 && (
            <PlanSection title="Prerequisites">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, lineHeight: 1.5 }}>
                {prereqs.map((p: any, i: number) => (
                  <div key={i}>
                    <span style={{ fontWeight: 600, color: W.text }}>{p.knowledge}</span>
                    {p.prereq_gap && <Badge variant="red">Gap</Badge>}
                    <span style={{ color: W.text3 }}>
                      {p.taught_in_topic ? ` — from ${p.taught_in_topic}` : ''}
                      {p.curricular_origin ? ` (${p.curricular_origin})` : ''}
                    </span>
                    {p.scope_boundary && <div style={{ fontSize: 12, color: W.text2 }}>Needs: {p.scope_boundary}</div>}
                  </div>
                ))}
              </div>
            </PlanSection>
          )}

          {/* hour allocation */}
          {hourChips.length > 0 && (
            <PlanSection title="Hour allocation">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {hourChips.map(([label, v]) => (
                  <div key={label} style={{ border: `1px solid ${W.border}`, borderRadius: 8, padding: '8px 14px', background: W.surfaceMuted }}>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: W.fontDisplay, color: W.text, fontVariantNumeric: 'tabular-nums' }}>{v}h</div>
                    <div style={{ fontSize: 11, color: W.text3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </PlanSection>
          )}

          {/* session plan */}
          {sessions.length > 0 && (
            <PlanSection title={`Session plan (${sessions.length} sessions)`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessions.map((s: any, i: number) => (
                  <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 12.5, color: W.text, fontFamily: W.fontDisplay }}>
                        {s.session_no != null ? `S${s.session_no}` : `S${i + 1}`}{s.title ? ` — ${s.title}` : ''}
                      </span>
                      {s.instruction_type && <Badge variant={s.instruction_type === 'Assessment' ? 'orange' : s.instruction_type === 'Tutorial' ? 'info' : 'muted'}>{s.instruction_type}</Badge>}
                      {(s.minutes ?? s.duration_minutes) != null && <span style={{ fontSize: 11.5, color: W.text3, fontVariantNumeric: 'tabular-nums' }}>{s.minutes ?? s.duration_minutes} min</span>}
                    </div>
                    {s.pre_class_prep && s.pre_class_prep !== 'None' && (
                      <div style={{ fontSize: 12, color: W.text2, marginTop: 4 }}><span style={{ fontWeight: 600 }}>Prep:</span> {s.pre_class_prep}</div>
                    )}
                    {(s.in_class_activities?.length ?? 0) > 0 && (
                      <div style={{ fontSize: 12, color: W.text2, marginTop: 2 }}>{s.in_class_activities.join(' · ')}</div>
                    )}
                    {(s.concepts_covered?.length ?? 0) > 0 && (
                      <div style={{ fontSize: 11.5, color: W.text3, marginTop: 4 }}>Covers: {s.concepts_covered.map(conceptName).join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            </PlanSection>
          )}

          {/* resources */}
          {resources && ((resources.prescribed_textbooks?.length ?? 0) + (resources.reference_books?.length ?? 0) + (resources.official_documentation?.length ?? 0)) > 0 && (
            <PlanSection title="Resources">
              <div style={{ fontSize: 12.5, color: W.text2, display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.5 }}>
                {(resources.prescribed_textbooks ?? []).map((b: string, i: number) => <div key={`t${i}`}>📘 {b}</div>)}
                {(resources.reference_books ?? []).map((b: string, i: number) => <div key={`r${i}`}>📗 {b}</div>)}
                {(resources.official_documentation ?? []).map((d: string, i: number) => <div key={`d${i}`}>🔗 {d}</div>)}
              </div>
            </PlanSection>
          )}

          {/* assessment blueprint */}
          {assess && (assess.quiz_blueprint || assess.assignment_or_lab_blueprint || assess.quiz_bloom_range) && (
            <PlanSection title="Assessment blueprint">
              <div style={{ fontSize: 12.5, color: W.text2, display: 'flex', flexDirection: 'column', gap: 5, lineHeight: 1.55 }}>
                {assess.quiz_bloom_range && <div><span style={{ fontWeight: 600, color: W.text }}>Quiz Bloom range:</span> {assess.quiz_bloom_range}</div>}
                {assess.quiz_blueprint?.format && (
                  <div>
                    <span style={{ fontWeight: 600, color: W.text }}>Quiz:</span> {assess.quiz_blueprint.format}
                    {assess.quiz_blueprint.attainment_benchmark ? ` — ${assess.quiz_blueprint.attainment_benchmark}` : ''}
                    {(assess.quiz_blueprint.target_tlos?.length ?? 0) > 0 && <span style={{ color: W.text3 }}> (targets {assess.quiz_blueprint.target_tlos.join(', ')})</span>}
                  </div>
                )}
                {assess.assignment_skew && <div><span style={{ fontWeight: 600, color: W.text }}>Assignment skew:</span> {assess.assignment_skew}</div>}
                {assess.assignment_or_lab_blueprint && <div><span style={{ fontWeight: 600, color: W.text }}>Assignment / lab:</span> {assess.assignment_or_lab_blueprint}</div>}
                {(assess.must_assess_concepts?.length ?? 0) > 0 && (
                  <div style={{ fontSize: 12, color: W.text3 }}>Must assess: {assess.must_assess_concepts.map(conceptName).join(', ')}</div>
                )}
              </div>
            </PlanSection>
          )}

          {/* compliance gate */}
          {gate && (
            <PlanSection title="Compliance self-check (advisory — code validators are authoritative)">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(GATE_LABELS).map(([key, label]) => gate[key] == null ? null : (
                  <Badge key={key} variant={gate[key] ? 'green' : 'red'}>{gate[key] ? '✓' : '✕'} {label}</Badge>
                ))}
              </div>
              {(gate.blocking_items?.length ?? 0) > 0 && (
                <div style={{ fontSize: 12, color: W.redFg, marginTop: 8 }}>Blocking: {gate.blocking_items.join(', ')}</div>
              )}
            </PlanSection>
          )}
        </div>
      )}
    </div>
  );
}
