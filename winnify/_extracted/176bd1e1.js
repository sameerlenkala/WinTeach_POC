// Root App: state, routing, providers
function App() {
  // Routing — internal state-based (no actual URL changes)
  const [route, setRoute] = useState({ screen: "slog:list", params: {} });
  const go = (screen, params = {}) => setRoute({ screen, params });

  // Tweaks — persisted via __edit_mode_set_keys protocol
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "milestoneVariant": "phases-cards",
    "skillTreeVariant": "branching",
    "heatmapPosition": "bottom"
  }/*EDITMODE-END*/;
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const setTweak = (key, value) => {
    setTweaks(prev => {
      const next = typeof key === "object" ? { ...prev, ...key } : { ...prev, [key]: value };
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: typeof key === "object" ? key : { [key]: value } }, "*");
      return next;
    });
  };

  // App state — sessions, modals, toasts
  const [state, _setState] = useState({
    sessions: WINNIFY.sessions,
    firstVisit: false,
    draft: null,
    generating: false,
    offline: false,
    quizDone: {},
    dismissed: [],
  });
  const setState = (patch) => _setState(prev => ({ ...prev, ...patch }));

  const [modal, setModal] = useState(null);
  const openModal = (m) => setModal(m);
  const closeModal = () => setModal(null);

  const [toast, setToast] = useState("");
  const showToast = (msg) => setToast(msg);

  const ctx = {
    user: WINNIFY.user,
    route, go,
    state, setState,
    modal, openModal, closeModal,
    tweaks, setTweak,
    showToast,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app">
        <UI.Sidebar/>
        <main className="main">
          <ScreenRouter/>
        </main>
      </div>
      {state.generating && <GeneratingOverlay/>}
      <ModalRouter/>
      <OfflineBanner/>
      <UI.Toast msg={toast} onDone={() => setToast("")}/>
      <TweaksPanel/>
    </AppCtx.Provider>
  );
}

function ScreenRouter() {
  const { route } = useApp();
  switch (route.screen) {
    case "home":           return <ScreenHome/>;
    case "slog:list":      return <ScreenSessionsList/>;
    case "slog:setup-1":   return <ScreenSetup1/>;
    case "slog:setup-2":   return <ScreenSetup2/>;
    case "slog:setup-3":   return <ScreenSetup3/>;
    case "slog:dashboard": return <ScreenDashboard/>;
    case "slog:phase":     return <ScreenPhase/>;
    case "slog:cluster":   return <ScreenCluster/>;
    case "slog:topic":     return <ScreenTopic/>;
    case "slog:adaptive":  return <ScreenAdaptive/>;
    case "slog:interview": return <ScreenInterview/>;
    case "slog:mock":      return <ScreenMock/>;
    case "slog:mock-assessment":         return <ScreenMockAssessment/>;
    case "slog:mock-assessment-results": return <ScreenMockAssessmentResults/>;
    case "slog:fo-complete":     return <ScreenFOComplete/>;
    case "slog:gd-simulation":   return <ScreenGDSimulation/>;
    case "slog:gd-debrief":      return <ScreenGDDebrief/>;
    // v2.0 — Aptitude (Powerplay)
    case "slog:aptitude-hub":    return <ScreenAptitudeHub/>;
    case "slog:aptitude-sub":    return <ScreenAptitudeSub/>;
    case "slog:apt-topic":         return <ScreenAptTopic/>;
    // v2.0 — Acceleration
    case "slog:acc-topic":           return <ScreenAccTopic/>;
    case "slog:acc-subtopic":        return <ScreenAccSubtopic/>;
    case "slog:acc-mcq":             return <ScreenAccMCQ/>;
    case "slog:acc-cheatsheet":      return <ScreenAccCheatSheet/>;
    case "slog:acc-winspeak":        return <ScreenAccWinSpeak/>;
    case "slog:acc-winspeak-report": return <ScreenAccWinSpeakReport/>;
    case "slog:acc-behavioral":      return <ScreenAccBehavioral/>;
    case "slog:acc-beh-single":      return <ScreenAccBehSingle/>;
    case "slog:acc-beh-practice":    return <ScreenAccBehPractice/>;
    case "slog:acc-beh-report":      return <ScreenAccBehReport/>;
    case "slog:acc-apthub":          return <ScreenAccAptHub/>;
    case "slog:acc-apt-type":        return <ScreenAccAptType/>;
    // legacy/retired (kept for safety; if hit, route to new acceleration home)
    case "slog:blitz":           return <ScreenPhase/>;
    case "slog:accel-interview": return <ScreenPhase/>;
    case "slog:accel-triage":    return <ScreenPhase/>;
    case "slog:resume":    return <ScreenResume/>;
    case "winspeak":       return <ScreenPlaceholder title="WinSpeak" icon={<Icons.Mic/>} blurb="Standalone WinSpeak module — speech-first interview practice. Slog Overs embeds WinSpeak inside the Interview Prep cluster; progress here would be independent."/>;
    case "foundation":     return <ScreenPlaceholder title="Foundation" icon={<Icons.Book/>} blurb="Standalone Foundation content library — DSA, DBMS, OS, Networking, System Design. Slog Overs surfaces Foundation through phase-scoped clusters."/>;
    case "library":        return <ScreenPlaceholder title="Role Library" icon={<Icons.Folder/>} blurb="Catalog of roles and their default round structures. Used when you start a new Slog Over."/>;
    default:               return <ScreenSessionsList/>;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
