// SO-20 Mark complete · SO-22 Extend · SO-23 Duplicate · Low-completion phase switch warning
// + Offline / slow-connection banner (US-9.1, US-9.2)

function ModalRouter() {
  const { modal, closeModal } = useApp();
  if (!modal) return null;
  return (
    <UI.Modal open onClose={closeModal} size={modal.kind === "mark-complete" ? "modal-lg" : ""}>
      {modal.kind === "mark-complete" && <MarkCompleteModal modal={modal} onClose={closeModal}/>}
      {modal.kind === "extend"        && <ExtendModal modal={modal} onClose={closeModal}/>}
      {modal.kind === "duplicate"     && <DuplicateModal modal={modal} onClose={closeModal}/>}
      {modal.kind === "low-completion"&& <LowCompletionModal modal={modal} onClose={closeModal}/>}
      {modal.kind === "start-phase"   && <StartPhaseModal modal={modal} onClose={closeModal}/>}
    </UI.Modal>
  );
}

// SO-20
function MarkCompleteModal({ modal, onClose }) {
  const { state, setState, showToast } = useApp();
  const [reason, setReason] = useState("placed");
  const [note, setNote] = useState("");
  const s = state.sessions.find(x => x.id === modal.sid);

  const submit = () => {
    setState({
      sessions: state.sessions.map(x => x.id === modal.sid ? { ...x, status: "archived", closedReason: reason, closedAt: new Date().toISOString() } : x)
    });
    showToast(`${s?.role} session marked complete.`);
    onClose();
  };

  const reasons = [
    { id: "placed", label: "Got placed / accepted offer", icon: <Icons.Trophy size={16}/> },
    { id: "postponed", label: "Interview cancelled / postponed" },
    { id: "switching", label: "Switching target role" },
    { id: "uninterested", label: "No longer interested" },
    { id: "completed", label: "Completed prep" },
    { id: "other", label: "Other" },
  ];

  return (
    <>
      <div className="modal-head">
        <div className="label">SO-20 · Mark complete</div>
        <h2 className="h-2 mt-2">Close “{s?.role}” session</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          Historical data — progress, mocks, tasks — is preserved in a read-only archive. You can reopen anytime from the archived list.
        </p>
      </div>
      <div className="modal-pad" style={{paddingTop: 0}}>
        <div className="label">Reason for closing</div>
        <div className="col gap-2 mt-2">
          {reasons.map(r => (
            <label key={r.id} className="row gap-3" style={{
              padding: "10px 12px",
              border: `1px solid ${reason === r.id ? "var(--ink-1)" : "var(--line-2)"}`,
              borderRadius: 8, cursor: "pointer",
              background: reason === r.id ? "var(--surface-2)" : "transparent",
            }}>
              <input type="radio" name="reason" checked={reason === r.id} onChange={() => setReason(r.id)}/>
              {r.icon}
              <span style={{fontSize: 13.5}}>{r.label}</span>
            </label>
          ))}
        </div>
        {reason === "other" && (
          <textarea className="textarea mt-3" rows="3" placeholder="Tell us what happened (optional)" value={note} onChange={e => setNote(e.target.value)}/>
        )}
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>Mark complete</button>
      </div>
    </>
  );
}

// SO-22
function ExtendModal({ modal, onClose }) {
  const { state, setState, showToast } = useApp();
  const min = (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0,10); })();
  const [date, setDate] = useState(min);
  const s = state.sessions.find(x => x.id === modal.sid);
  const submit = () => {
    setState({
      sessions: state.sessions.map(x => x.id === modal.sid ? { ...x, targetDate: new Date(date).toISOString(), status: "active" } : x)
    });
    showToast(`Target date extended to ${WUTIL.fmtDate(new Date(date))}.`);
    onClose();
  };
  return (
    <>
      <div className="modal-head">
        <div className="label">SO-22 · Extend target date</div>
        <h2 className="h-2 mt-2">Pick a new interview date</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          AI will resume Day View task assignment from the current phase. Foundation progress is preserved.
        </p>
      </div>
      <div className="modal-pad" style={{paddingTop: 0}}>
        <div className="field">
          <label>New target interview date</label>
          <input type="date" className="input" min={min} value={date} onChange={e => setDate(e.target.value)}/>
          <div className="hint">Minimum 3 days from today.</div>
        </div>
        <div className="banner info mt-4">
          <Icons.Info size={14}/>
          <span>You're extending an expired session. Your existing progress in {s && WUTIL.phaseLabel(s.activePhase)} is kept as-is.</span>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>Extend &amp; reactivate</button>
      </div>
    </>
  );
}

// SO-23
function DuplicateModal({ modal, onClose }) {
  return (
    <>
      <div className="modal-head">
        <div className="label">SO-23 · Duplicate role warning</div>
        <h2 className="h-2 mt-2">You already have a Slog Over for “{modal.role}”</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          Running two sessions for the same role is supported — Foundation progress is shared, but Interview Prep and Resume gap lists stay separate. Are you sure?
        </p>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onClose(); modal.onContinue?.(); }}>Continue anyway</button>
      </div>
    </>
  );
}

// Low completion phase switch warning (US-4.2)
function LowCompletionModal({ modal, onClose }) {
  return (
    <>
      <div className="modal-head">
        <div className="label">Phase switch · low Foundation completion</div>
        <h2 className="h-2 mt-2">You may not be ready for Final Over</h2>
      </div>
      <div className="modal-pad" style={{paddingTop: 0}}>
        <div className="card card-pad" style={{background: "var(--warn-tint)", border: "1px solid #f5c89a"}}>
          <div className="row between">
            <div className="label">Foundation completion</div>
            <span className="mono" style={{fontSize: 22}}>{WUTIL.pct(modal.fcPct)}%</span>
          </div>
          <div className="progress thick mt-3" style={{height: 8}}><span style={{width: WUTIL.pct(modal.fcPct) + "%"}}></span></div>
        </div>
        <div className="muted mt-3" style={{fontSize: 13.5, lineHeight: 1.6}}>
          Final Over is designed for simulation and review. Mock interviews and company-specific scenarios assume you've covered the Powerplay foundations. Switching now may surface as wide gaps in your debrief.
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Stay in current phase</button>
        <button className="btn btn-danger" onClick={() => { onClose(); modal.onConfirm?.(); }}>Switch anyway</button>
      </div>
    </>
  );
}

// US-4.1 · Start Phase confirmation (replaces v1.1 card-tap switch)
function StartPhaseModal({ modal, onClose }) {
  return (
    <>
      <div className="modal-head">
        <div className="label">US-4.1 · Switch active phase</div>
        <h2 className="h-2 mt-2">Switch active phase to {WUTIL.phaseLabel(modal.to)}?</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          Your current phase progress in <strong>{WUTIL.phaseLabel(modal.from)}</strong> is saved. No recalculation — existing progress in {WUTIL.phaseLabel(modal.to)} is preserved.
        </p>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onClose(); modal.onConfirm?.(); }}>Confirm switch</button>
      </div>
    </>
  );
}

// Offline banner (US-9.1, US-9.2)
function OfflineBanner() {
  const { state, setState } = useApp();
  if (!state.offline) return null;
  return (
    <div style={{
      position: "fixed", bottom: 16, left: 16,
      maxWidth: 320, padding: "10px 14px",
      borderRadius: 8, background: "var(--ink-1)", color: "var(--paper)",
      fontSize: 12.5, display: "flex", gap: 10, alignItems: "flex-start",
      boxShadow: "var(--shadow-pop)", zIndex: 40,
    }}>
      <Icons.WiFiOff size={14}/>
      <div className="col" style={{gap: 4}}>
        <strong>Slow / unreliable connection</strong>
        <span style={{opacity: .8}}>Practice disabled. Summaries and Flashcards available read-only. Last checkpoint auto-saved.</span>
        <button className="btn btn-sm" style={{marginTop: 6, alignSelf: "flex-start", background: "var(--paper)", color: "var(--ink-1)"}} onClick={() => setState({ offline: false })}>Retry</button>
      </div>
    </div>
  );
}

window.ModalRouter = ModalRouter;
window.OfflineBanner = OfflineBanner;
