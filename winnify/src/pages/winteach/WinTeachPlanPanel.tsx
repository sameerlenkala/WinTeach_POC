// Topic Plan in the generation studio: a single-line summary bar; the full
// plan opens in a large modal with tabs (Outcomes / Sessions / Assessment /
// Resources). The modal supports editing the TLO set and session plan
// (persisted via savePlanSections) and regenerating the whole plan (with a
// warning — concept ids are re-derived). Every section is guarded on
// presence so older plans render whatever they have.
import { useState } from 'react';
import { W } from './winteachStyles';
import { Badge, Btn, Modal } from './WinTeachUI';
import { generationApi } from '@/api/generation';

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
const editInput: React.CSSProperties = {
  width: '100%', background: 'var(--input-bg)', border: `1.5px solid ${W.border}`,
  borderRadius: 7, padding: '7px 10px', fontFamily: W.fontSans, fontSize: 12.5,
  color: 'var(--input-fg)', outline: 'none', boxSizing: 'border-box',
};

const BLOOM_LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
const SESSION_TYPES = ['Lecture', 'Tutorial', 'Assessment'];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: W.text3, margin: '16px 0 8px' }}>
      {children}
    </div>
  );
}

function bloomBadge(lvl?: string) {
  return lvl ? <Badge variant="blue">{lvl}</Badge> : null;
}

const CONTRIB_STYLE: Record<string, { bg: string; fg: string }> = {
  High: { bg: W.greenBg, fg: W.greenFg },
  Medium: { bg: 'var(--tint-orange-bg)', fg: 'var(--tint-orange-fg)' },
  Low: { bg: W.surfaceMuted, fg: 'var(--text-3)' },
};

type Tab = 'outcomes' | 'sessions' | 'assessment' | 'resources';

export function TopicPlanPanel({ plan, jobId, onChanged }: {
  plan: any; jobId?: string; onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!plan) return null;

  const hero = plan.hero_block ?? {};
  const gate = plan.compliance_gate;
  const gatePassed = gate?.outcome === 'PASS';
  const tloCount = (plan.tlo_set ?? []).length;
  const sessionCount = (plan.session_plan ?? []).length;

  return (
    <>
      {/* ── single-line summary bar ── */}
      <button onClick={() => setOpen(true)} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
        background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 10,
        boxShadow: W.shadowCard, marginBottom: 14, padding: '11px 16px', cursor: 'pointer',
        transition: 'border-color .12s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = W.border; }}
      >
        <span style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 13.5, color: W.text, flexShrink: 0 }}>Topic plan</span>
        {hero.bloom_ceiling && <Badge variant="blue">Ceiling {hero.bloom_ceiling}</Badge>}
        {hero.total_hours != null && <Badge variant="muted">{hero.total_hours} hrs</Badge>}
        {gate && (gatePassed
          ? <Badge variant="green" dot>Compliance PASS</Badge>
          : <Badge variant="orange">Compliance {gate.outcome ?? '—'}</Badge>)}
        <span className="max-md:hidden" style={{ fontSize: 12, color: W.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {[tloCount ? `${tloCount} TLOs` : null, sessionCount ? `${sessionCount} sessions` : null, hero.obe_framework]
            .filter(Boolean).join(' · ')}
        </span>
        <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 12.5, color: 'var(--brand)', fontFamily: W.fontDisplay, fontWeight: 600 }}>
          View plan →
        </span>
      </button>

      {open && <PlanModal plan={plan} jobId={jobId} onChanged={onChanged} onClose={() => setOpen(false)} />}
    </>
  );
}

function PlanModal({ plan, jobId, onChanged, onClose }: {
  plan: any; jobId?: string; onChanged?: () => void; onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('outcomes');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [regenning, setRegenning] = useState(false);
  // Edit drafts — deep copies so cancel discards cleanly.
  const [draftTlos, setDraftTlos] = useState<any[]>([]);
  const [draftSessions, setDraftSessions] = useState<any[]>([]);

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

  const hasResources = !!resources && ((resources.prescribed_textbooks?.length ?? 0) + (resources.reference_books?.length ?? 0) + (resources.official_documentation?.length ?? 0)) > 0;
  const hasAssessment = (!!assess && !!(assess.quiz_blueprint || assess.assignment_or_lab_blueprint || assess.quiz_bloom_range)) || !!gate;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'outcomes', label: `Outcomes${cos.length ? ` · ${cos.length} CO` : ''}${tlos.length ? ` / ${tlos.length} TLO` : ''}`, show: cos.length > 0 || tlos.length > 0 },
    { id: 'sessions', label: `Sessions${sessions.length ? ` · ${sessions.length}` : ''}`, show: sessions.length > 0 },
    { id: 'assessment', label: 'Assessment', show: hasAssessment },
    { id: 'resources', label: `Resources${prereqs.length ? ' & prereqs' : ''}`, show: hasResources || prereqs.length > 0 },
  ];
  const visibleTabs = tabs.filter(t => t.show);
  const active = visibleTabs.some(t => t.id === tab) ? tab : (visibleTabs[0]?.id ?? 'outcomes');

  const startEdit = () => {
    setDraftTlos(tlos.map(t => ({ ...t })));
    setDraftSessions(sessions.map(s => ({ ...s, in_class_activities: [...(s.in_class_activities ?? [])] })));
    setEditing(true);
  };
  const saveEdits = async () => {
    if (!jobId) return;
    setSaving(true);
    try {
      await generationApi.savePlanSections(jobId, { tlo_set: draftTlos, session_plan: draftSessions });
      setEditing(false);
      onChanged?.();
    } catch { /* board shows unchanged plan */ }
    finally { setSaving(false); }
  };
  const regenerate = async () => {
    if (!jobId) return;
    setRegenning(true);
    try {
      await generationApi.regeneratePlan(jobId);
      onChanged?.();
      onClose();
    } catch { setRegenning(false); }
  };

  const patchTlo = (i: number, patch: any) => setDraftTlos(d => d.map((t, j) => j === i ? { ...t, ...patch } : t));
  const patchSession = (i: number, patch: any) => setDraftSessions(d => d.map((s, j) => j === i ? { ...s, ...patch } : s));

  const shownTlos = editing ? draftTlos : tlos;
  const shownSessions = editing ? draftSessions : sessions;

  return (
    <Modal onClose={onClose} maxWidth={940} title="Topic plan"
      subtitle={[hero.program_year_sem, hero.course_code_title, hero.unit_identifier, hero.obe_framework].filter(Boolean).join('  ·  ') || undefined}>

      {/* badges + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {hero.bloom_ceiling && <Badge variant="blue">Ceiling {hero.bloom_ceiling}</Badge>}
        {hero.total_hours != null && <Badge variant="muted">{hero.total_hours} hrs</Badge>}
        {gate && (gatePassed
          ? <Badge variant="green" dot>Compliance PASS</Badge>
          : <Badge variant="orange">Compliance {gate.outcome ?? '—'}</Badge>)}
        {jobId && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {editing ? (
              <>
                <Btn sm variant="ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</Btn>
                <Btn sm variant="primary" onClick={saveEdits} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Btn>
              </>
            ) : (
              <>
                <Btn sm variant="ghost" onClick={startEdit}>Edit</Btn>
                <Btn sm variant="ghost" onClick={() => setConfirmRegen(true)} disabled={regenning}>
                  {regenning ? 'Restarting…' : 'Regenerate plan'}
                </Btn>
              </>
            )}
          </div>
        )}
      </div>

      {confirmRegen && (
        <div style={{ border: `1px solid var(--status-orange)`, background: 'color-mix(in oklab, var(--status-orange) 8%, var(--card))', borderRadius: 9, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: W.text, lineHeight: 1.55, marginBottom: 10 }}>
            Regenerating rebuilds the whole plan and re-derives the subtopic numbering — any notes, slides or
            quizzes already generated for this topic may no longer match the new plan and should be regenerated
            afterwards. Continue?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn sm variant="primary" onClick={regenerate} disabled={regenning}>{regenning ? 'Restarting…' : 'Yes, regenerate'}</Btn>
            <Btn sm variant="ghost" onClick={() => setConfirmRegen(false)} disabled={regenning}>Keep current plan</Btn>
          </div>
        </div>
      )}

      {/* hour split */}
      {hourChips.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${hourChips.length}, minmax(0, 1fr))`, gap: 10, marginBottom: 14 }}>
          {hourChips.map(([label, v]) => (
            <div key={label} style={{ border: `1px solid ${W.border}`, borderRadius: 9, padding: '9px 14px', background: W.surfaceMuted, textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: W.fontDisplay, color: W.text, fontVariantNumeric: 'tabular-nums' }}>{v}h</div>
              <div style={{ fontSize: 10.5, color: W.text3, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: W.fontDisplay, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* tab bar */}
      {visibleTabs.length > 0 && (
        <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${W.border}` }}>
          {visibleTabs.map(t => {
            const on = t.id === active;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '9px 14px', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5,
                color: on ? 'var(--brand)' : W.text3,
                borderBottom: `2px solid ${on ? 'var(--brand)' : 'transparent'}`,
                marginBottom: -1, transition: 'color .12s, border-color .12s', whiteSpace: 'nowrap',
              }}>
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ paddingTop: 2 }}>
        {active === 'outcomes' && (
          <>
            {cos.length > 0 && (
              <>
                <SectionLabel>Course outcome mapping</SectionLabel>
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
                          <td style={td}>
                            {m.contribution_level ? (
                              <span style={{
                                fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, borderRadius: 99, padding: '2px 9px',
                                background: CONTRIB_STYLE[m.contribution_level]?.bg ?? W.surfaceMuted,
                                color: CONTRIB_STYLE[m.contribution_level]?.fg ?? W.text3,
                              }}>{m.contribution_level}</span>
                            ) : '—'}
                          </td>
                          <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>{m.topic_weight_pct != null ? `${m.topic_weight_pct}%` : '—'}</td>
                          <td style={td}>{m.alignment_justification ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {shownTlos.length > 0 && (
              <>
                <SectionLabel>Learning outcomes ({shownTlos.length} TLOs)</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {shownTlos.map((t: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: editing ? 'center' : 'baseline', fontSize: 12.5, lineHeight: 1.5, padding: '7px 12px', border: `1px solid ${W.border}`, borderRadius: 8, background: 'var(--card)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--brand)', fontFamily: W.fontDisplay, fontVariantNumeric: 'tabular-nums', flexShrink: 0, width: 26, fontSize: 11.5 }}>{t.tlo_id}</span>
                      {editing ? (
                        <>
                          <select value={t.bloom_level ?? 'L2'} onChange={e => patchTlo(i, { bloom_level: e.target.value })}
                            style={{ ...editInput, width: 64, flexShrink: 0, padding: '5px 6px' }}>
                            {BLOOM_LEVELS.map(l => <option key={l}>{l}</option>)}
                          </select>
                          <input value={t.statement ?? ''} onChange={e => patchTlo(i, { statement: e.target.value })} style={{ ...editInput, flex: 1 }} />
                        </>
                      ) : (
                        <>
                          {bloomBadge(t.bloom_level)}
                          <span style={{ color: W.text2, flex: 1 }}>{t.statement}</span>
                        </>
                      )}
                      {t.parent_co && (
                        <span style={{ flexShrink: 0, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 10.5, borderRadius: 5, padding: '1px 7px', background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)' }}>{t.parent_co}</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {active === 'sessions' && shownSessions.length > 0 && (
          <>
            <SectionLabel>Session plan ({shownSessions.length} sessions)</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {shownSessions.map((s: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, border: `1px solid ${W.border}`, borderRadius: 9, padding: '11px 14px' }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', background: 'var(--tint-brand-bg)',
                    color: 'var(--tint-brand-fg)', fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11.5,
                  }}>S{s.session_no ?? i + 1}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    {editing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input value={s.title ?? ''} onChange={e => patchSession(i, { title: e.target.value })} placeholder="Session title" style={{ ...editInput, flex: 1 }} />
                          <select value={s.instruction_type ?? 'Lecture'} onChange={e => patchSession(i, { instruction_type: e.target.value })} style={{ ...editInput, width: 110, flexShrink: 0 }}>
                            {SESSION_TYPES.map(x => <option key={x}>{x}</option>)}
                          </select>
                          <input type="number" value={s.minutes ?? s.duration_minutes ?? ''} onChange={e => patchSession(i, { minutes: e.target.value === '' ? null : Number(e.target.value) })}
                            placeholder="min" style={{ ...editInput, width: 70, flexShrink: 0 }} />
                        </div>
                        <input value={s.pre_class_prep ?? ''} onChange={e => patchSession(i, { pre_class_prep: e.target.value })} placeholder="Pre-class prep (or None)" style={editInput} />
                        <textarea value={(s.in_class_activities ?? []).join('\n')}
                          onChange={e => patchSession(i, { in_class_activities: e.target.value.split('\n').filter((x: string) => x.trim()) })}
                          placeholder="In-class activities — one per line" rows={2}
                          style={{ ...editInput, resize: 'vertical', lineHeight: 1.5 }} />
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 12.5, color: W.text, fontFamily: W.fontDisplay }}>{s.title ?? `Session ${i + 1}`}</span>
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
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                            {s.concepts_covered.map((cid: string) => (
                              <span key={cid} style={{ fontSize: 11, padding: '1px 8px', borderRadius: 99, background: W.surfaceMuted, border: `1px solid ${W.border}`, color: W.text2, whiteSpace: 'nowrap' }}>{conceptName(cid)}</span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {active === 'assessment' && (
          <>
            {assess && (assess.quiz_blueprint || assess.assignment_or_lab_blueprint || assess.quiz_bloom_range) && (
              <>
                <SectionLabel>Assessment blueprint</SectionLabel>
                <div style={{ fontSize: 12.5, color: W.text2, display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.55 }}>
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
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: W.text }}>Must assess:</span>
                      {assess.must_assess_concepts.map((cid: string) => (
                        <span key={cid} style={{ fontSize: 11, padding: '1px 8px', borderRadius: 99, background: W.surfaceMuted, border: `1px solid ${W.border}`, color: W.text2, whiteSpace: 'nowrap' }}>{conceptName(cid)}</span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            {gate && (
              <>
                <SectionLabel>Compliance self-check (advisory — code validators are authoritative)</SectionLabel>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(GATE_LABELS).map(([key, label]) => gate[key] == null ? null : (
                    <Badge key={key} variant={gate[key] ? 'green' : 'red'}>{gate[key] ? '✓' : '✕'} {label}</Badge>
                  ))}
                </div>
                {(gate.blocking_items?.length ?? 0) > 0 && (
                  <div style={{ fontSize: 12, color: W.redFg, marginTop: 8 }}>Blocking: {gate.blocking_items.join(', ')}</div>
                )}
              </>
            )}
          </>
        )}

        {active === 'resources' && (
          <>
            {prereqs.length > 0 && (
              <>
                <SectionLabel>Prerequisites</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {prereqs.map((p: any, i: number) => (
                    <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 8, padding: '9px 13px', fontSize: 12.5, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600, color: W.text }}>{p.knowledge}</span>
                      {p.prereq_gap && <span style={{ marginLeft: 6 }}><Badge variant="red">Gap</Badge></span>}
                      <span style={{ color: W.text3 }}>
                        {p.taught_in_topic ? ` — from ${p.taught_in_topic}` : ''}
                        {p.curricular_origin ? ` (${p.curricular_origin})` : ''}
                      </span>
                      {p.scope_boundary && <div style={{ fontSize: 12, color: W.text2, marginTop: 2 }}>Needs: {p.scope_boundary}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
            {hasResources && (
              <>
                <SectionLabel>Resources</SectionLabel>
                <div style={{ fontSize: 12.5, color: W.text2, display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.5 }}>
                  {(resources.prescribed_textbooks ?? []).map((b: string, i: number) => <div key={`t${i}`}>📘 {b}</div>)}
                  {(resources.reference_books ?? []).map((b: string, i: number) => <div key={`r${i}`}>📗 {b}</div>)}
                  {(resources.official_documentation ?? []).map((d: string, i: number) => <div key={`d${i}`}>🔗 {d}</div>)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
