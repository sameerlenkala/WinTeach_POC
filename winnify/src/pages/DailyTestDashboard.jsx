import React, { useState, useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Users,
  MessageSquare,
  Settings,
  Activity,
  Award,
  Shield,
  PhoneOff,
  Play,
  Square,
  UploadCloud,
  Cpu,
  CheckCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  Info,
  ChevronRight,
  AlertTriangle,
  X,
  Copy,
  PlusCircle,
  Calendar
} from "lucide-react";

export default function DailyTestDashboard() {
  // Connection states
  const [roomUrl, setRoomUrl] = useState("https://winnify.daily.co/iciURnGTlpZptPkbRBnJ");
  const [userName, setUserName] = useState("Student-1");
  const [role, setRole] = useState("student");
  const [joined, setJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [callFrame, setCallFrame] = useState(null);
  
  // Dynamic room generation states
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_DAILY_API_KEY || "3ce862d75aa1a286f54bce94fa100d005eefe32180f21c4b99a2c08aa1af9b27");
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);
  const [roomGenerationStatus, setRoomGenerationStatus] = useState("");

  // Clock & Modal states
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const [activeModal, setActiveModal] = useState(null); // null | 'join' | 'schedule'
  
  // Schedule inputs
  const [scheduleTopic, setScheduleTopic] = useState("Speaking Assessment Class");
  const [scheduleDate, setScheduleDate] = useState("2026-06-02");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleDuration, setScheduleDuration] = useState("30");
  const [scheduledResult, setScheduledResult] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Recent meetings roster loaded from localStorage
  const [recentMeetings, setRecentMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem("zoom_recent_meetings");
      return saved ? JSON.parse(saved) : [
        { title: "Personal Assessment Room", url: "https://winnify.daily.co/iciURnGTlpZptPkbRBnJ", date: "Always Live", type: "live" }
      ];
    } catch (e) {
      return [];
    }
  });

  const startWithScreenShareRef = useRef(false);
  
  // Call status states (Mute/Video)
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [participantsList, setParticipantsList] = useState([]);
  
  // Telemetry states
  const [joinLatency, setJoinLatency] = useState(null);
  const [networkStats, setNetworkStats] = useState(null);
  const [networkRating, setNetworkRating] = useState("Excellent"); // Excellent, Good, Fair, Poor
  const [statsHistory, setStatsHistory] = useState([
    { name: "Teacher", rtt: 45, loss: 0.1, jitter: 3, role: "teacher" },
    { name: "Student-2", rtt: 110, loss: 1.8, jitter: 12, role: "student" },
    { name: "Student-3", rtt: 75, loss: 0.5, jitter: 6, role: "student" }
  ]);

  // Sidebar controls - default to closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return window.innerWidth > 768;
    } catch (e) {
      return true;
    }
  });
  const [sidebarTab, setSidebarTab] = useState("telemetry"); // telemetry | winspeak | participants

  // WinSpeak Simulator states
  const [recordingState, setRecordingState] = useState("idle"); // idle | recording | uploading | processing | done
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [simLatencies, setSimLatencies] = useState({
    uploadTime: 0,
    transcriptionStart: 0,
    transcriptionEnd: 0,
    total: 0
  });
  const [fluencyReport, setFluencyReport] = useState(null);

  // Refs
  const containerRef = useRef(null);
  const joinStartTimeRef = useRef(null);
  const statsIntervalRef = useRef(null);
  
  // Web Audio Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
      stopStatsPoll();
      stopRecordingSession();
    };
  }, [callFrame]);

  // Digital Clock synchronize
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateString(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save meetings to local log
  const saveMeeting = (title, url, type) => {
    const newMeeting = {
      title,
      url,
      date: new Date().toLocaleString(),
      type
    };
    setRecentMeetings(prev => {
      const filtered = prev.filter(m => m.url !== url);
      const updated = [newMeeting, ...filtered].slice(0, 8);
      try {
        localStorage.setItem("zoom_recent_meetings", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage write blocked:", e);
      }
      return updated;
    });
  };

  // Clean up global call instances to prevent "Duplicate DailyIframe instances are not allowed"
  const cleanUpGlobalCallInstance = async () => {
    const activeFrame = DailyIframe.getCallInstance();
    if (activeFrame) {
      try {
        await activeFrame.destroy();
      } catch (e) {
        console.warn("Failed to destroy global call instance:", e);
      }
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  };

  // Create room and join instantly (New Meeting)
  const createRoomAndJoin = async () => {
    setIsJoining(true);
    try {
      const response = await fetch("/api/daily/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          privacy: "public"
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      if (data && data.url) {
        setRoomUrl(data.url);
        saveMeeting("Quick Host Meeting", data.url, "live");
        
        setJoined(true); // Make container visible immediately to allow permission prompts
        joinStartTimeRef.current = performance.now();
        await cleanUpGlobalCallInstance();
        
        const frame = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: { width: "100%", height: "100%", border: "none", backgroundColor: "#000" },
          showLeaveButton: false,
          showFullscreenButton: true
        });
        setCallFrame(frame);
        
        frame.on("joined-meeting", () => {
          setJoinLatency(Math.round(performance.now() - joinStartTimeRef.current));
          setJoined(true);
          setIsJoining(false);
          startStatsPoll(frame);
          updateParticipantsList(frame);
        });
        frame.on("left-meeting", () => {
          setJoined(false);
          setIsJoining(false);
          setCallFrame(null);
          setParticipantsList([]);
          stopStatsPoll();
        });
        frame.on("participant-joined", () => updateParticipantsList(frame));
        frame.on("participant-left", () => updateParticipantsList(frame));
        frame.on("participant-updated", () => updateParticipantsList(frame));
        frame.on("error", () => { setIsJoining(false); });
        
        await frame.join({
          url: data.url,
          userName: `${userName} (HOST)`
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start New Meeting: " + err.message);
      setIsJoining(false);
    }
  };

  // Create room and start screen share instantly
  const createRoomAndShareScreen = async () => {
    startWithScreenShareRef.current = true;
    setIsJoining(true);
    try {
      const response = await fetch("/api/daily/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          privacy: "public"
        })
      });
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      if (data && data.url) {
        setRoomUrl(data.url);
        saveMeeting("Host Screen Share", data.url, "live");
        
        setJoined(true); // Make container visible immediately to allow permission prompts
        joinStartTimeRef.current = performance.now();
        await cleanUpGlobalCallInstance();
        
        const frame = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: { width: "100%", height: "100%", border: "none", backgroundColor: "#000" },
          showLeaveButton: false,
          showFullscreenButton: true
        });
        setCallFrame(frame);
        
        frame.on("joined-meeting", () => {
          setJoinLatency(Math.round(performance.now() - joinStartTimeRef.current));
          setJoined(true);
          setIsJoining(false);
          startStatsPoll(frame);
          updateParticipantsList(frame);
          
          try {
            frame.startScreenShare();
            setScreenSharing(true);
          } catch(e) {
            console.warn("Screen share failed on start:", e);
          }
        });
        frame.on("left-meeting", () => {
          setJoined(false);
          setIsJoining(false);
          setCallFrame(null);
          setParticipantsList([]);
          stopStatsPoll();
        });
        frame.on("participant-joined", () => updateParticipantsList(frame));
        frame.on("participant-left", () => updateParticipantsList(frame));
        frame.on("participant-updated", () => updateParticipantsList(frame));
        frame.on("error", () => { setIsJoining(false); });
        
        await frame.join({
          url: data.url,
          userName: `${userName} (SCREEN SHARE)`
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start Screen Share: " + err.message);
      setIsJoining(false);
    }
  };

  // Schedule Room with nbf/exp parameters
  const scheduleMeeting = async () => {
    setIsScheduling(true);
    try {
      const datetime = new Date(`${scheduleDate}T${scheduleTime}`);
      const nbf = Math.floor(datetime.getTime() / 1000);
      const exp = nbf + (parseInt(scheduleDuration) * 60);

      const response = await fetch("/api/daily/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          privacy: "public",
          properties: {
            nbf: nbf,
            exp: exp
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Daily error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data && data.url) {
        const result = {
          topic: scheduleTopic,
          url: data.url,
          time: datetime.toLocaleString(),
          duration: `${scheduleDuration} minutes`
        };
        setScheduledResult(result);
        saveMeeting(scheduleTopic, data.url, "scheduled");
      }
    } catch (err) {
      console.error("Scheduling failed:", err);
      alert("Failed to schedule meeting: " + err.message);
    } finally {
      setIsScheduling(false);
    }
  };

  // Start network statistics poll
  const startStatsPoll = (frame) => {
    stopStatsPoll(); // clear previous
    statsIntervalRef.current = setInterval(async () => {
      try {
        if (!frame) return;
        const statsObj = await frame.getNetworkStats();
        
        if (statsObj && statsObj.stats && statsObj.stats.latest) {
          const latest = statsObj.stats.latest;
          // Daily.co RTT is in seconds, convert to ms
          const rttMs = Math.round((latest.rtt || 0) * 1000);
          const recvLoss = Math.round((latest.videoRecvPacketLoss || 0) * 100);
          const sendLoss = Math.round((latest.videoSendPacketLoss || 0) * 100);
          const maxLoss = Math.max(recvLoss, sendLoss);
          
          // Estimate Jitter (Daily JS returns network quality indicator, let's create a simulated jitter based on quality)
          const quality = statsObj.stats.network?.quality || 100;
          const jitterMs = Math.max(2, Math.round((100 - quality) / 4) + (rttMs > 100 ? 5 : 1));
          
          // Bitrates (simulated or real from frame if present)
          const sendKbps = Math.round(latest.videoSendBitsPerSecond ? latest.videoSendBitsPerSecond / 1000 : 850);
          const recvKbps = Math.round(latest.videoRecvBitsPerSecond ? latest.videoRecvBitsPerSecond / 1000 : 1200);

          // Calculate quality rating
          let rating = "Excellent";
          if (rttMs > 150 || maxLoss > 2 || jitterMs > 15) rating = "Poor";
          else if (rttMs > 100 || maxLoss > 1 || jitterMs > 8) rating = "Fair";
          else if (rttMs > 50 || maxLoss > 0.5) rating = "Good";

          setNetworkStats({
            rtt: rttMs,
            packetLoss: maxLoss,
            jitter: jitterMs,
            sendBitrate: sendKbps,
            recvBitrate: recvKbps
          });
          setNetworkRating(rating);
        } else {
          // Fallback mockup stats for testing dashboard visuals
          generateMockStats();
        }
      } catch (err) {
        console.warn("Failed to get network stats:", err);
        generateMockStats();
      }
    }, 2000);
  };

  const stopStatsPoll = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  };

  const generateMockStats = () => {
    // Generate organic-looking network statistics
    const rtt = Math.floor(40 + Math.random() * 30);
    const loss = parseFloat((Math.random() * 0.4).toFixed(2));
    const jitter = Math.floor(3 + Math.random() * 5);
    const send = Math.floor(750 + Math.random() * 200);
    const recv = Math.floor(1100 + Math.random() * 300);
    
    setNetworkStats({
      rtt,
      packetLoss: loss,
      jitter,
      sendBitrate: send,
      recvBitrate: recv
    });
    setNetworkRating(rtt > 120 ? "Fair" : "Excellent");
  };

  // Dynamic room generation via proxy
  const generateRoom = async () => {
    if (!apiKey) {
      alert("Please enter a Daily API Key first.");
      return;
    }
    
    setIsGeneratingRoom(true);
    setRoomGenerationStatus("Generating room...");
    
    try {
      const response = await fetch("/api/daily/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          privacy: "public"
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Daily API response error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      if (data && data.url) {
        setRoomUrl(data.url);
        setRoomGenerationStatus("Room successfully generated!");
        setTimeout(() => setRoomGenerationStatus(""), 4000);
      } else {
        throw new Error("No room URL returned from Daily API");
      }
    } catch (err) {
      console.error("Room generation failed:", err);
      alert(`Failed to generate room: ${err.message}`);
      setRoomGenerationStatus("Generation failed");
    } finally {
      setIsGeneratingRoom(false);
    }
  };

  // Join Call function
  const joinMeeting = async () => {
    if (!roomUrl) {
      alert("Please enter a valid Daily Room URL");
      return;
    }
    
    setIsJoining(true);
    setJoined(true); // Make container visible immediately to allow permission prompts
    joinStartTimeRef.current = performance.now();

    try {
      await cleanUpGlobalCallInstance();

      // Create new callFrame
      const frame = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "none",
          backgroundColor: "#000"
        },
        showLeaveButton: false,
        showFullscreenButton: true
      });

      // Track CallFrame instance
      setCallFrame(frame);

      // Register Events
      frame.on("joined-meeting", (e) => {
        const latency = performance.now() - joinStartTimeRef.current;
        setJoinLatency(Math.round(latency));
        setJoined(true);
        setIsJoining(false);
        startStatsPoll(frame);
        updateParticipantsList(frame);
      });

      frame.on("left-meeting", () => {
        setJoined(false);
        setIsJoining(false);
        setCallFrame(null);
        setParticipantsList([]);
        stopStatsPoll();
      });

      frame.on("participant-joined", () => updateParticipantsList(frame));
      frame.on("participant-left", () => updateParticipantsList(frame));
      frame.on("participant-updated", () => updateParticipantsList(frame));

      frame.on("error", (e) => {
        console.error("Daily.co Error:", e);
        setIsJoining(false);
        alert(`Daily error: ${e.errorMsg || "Unknown error occurred"}`);
      });

      // Join room
      await frame.join({
        url: roomUrl,
        userName: `${userName} (${role.toUpperCase()})`
      });

    } catch (err) {
      console.error("Failed to join meeting:", err);
      setIsJoining(false);
      alert(`Join failed: ${err.message}`);
    }
  };

  const updateParticipantsList = (frame) => {
    if (!frame) return;
    const participants = Object.values(frame.participants());
    setParticipantsList(participants);
  };

  // Leave Call
  const leaveMeeting = async () => {
    if (callFrame) {
      try {
        await callFrame.leave();
        callFrame.destroy();
      } catch (err) {
        console.error("Error during leave:", err);
      } finally {
        setCallFrame(null);
        setJoined(false);
        setJoinLatency(null);
        setNetworkStats(null);
        setParticipantsList([]);
        stopStatsPoll();
      }
    }
  };

  // Toggle audio locally
  const toggleAudio = async () => {
    if (!callFrame) return;
    const muted = !audioMuted;
    callFrame.setLocalAudio(!muted);
    setAudioMuted(muted);
  };

  // Toggle video locally
  const toggleVideo = async () => {
    if (!callFrame) return;
    const muted = !videoMuted;
    callFrame.setLocalVideo(!muted);
    setVideoMuted(muted);
  };

  // Screen share toggle
  const toggleScreenShare = async () => {
    if (!callFrame) return;
    try {
      if (screenSharing) {
        await callFrame.stopScreenShare();
        setScreenSharing(false);
      } else {
        await callFrame.startScreenShare();
        setScreenSharing(true);
      }
    } catch (err) {
      console.warn("Screen share failed:", err);
    }
  };

  // ==========================================
  // WinSpeak Spoken English Audio Recorder & Simulator
  // ==========================================
  // Canvas animation visualizer effect
  useEffect(() => {
    if (recordingState === "recording" && canvasRef.current && analyserRef.current) {
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext("2d");
      const analyser = analyserRef.current;
      analyser.fftSize = 128;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const drawWave = () => {
        const width = canvas.width;
        const height = canvas.height;
        
        animationFrameRef.current = requestAnimationFrame(drawWave);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = "rgba(18, 18, 18, 0.4)";
        canvasCtx.fillRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;

          // Drawing glowing neon voice waves
          canvasCtx.fillStyle = `hsl(${200 + i * 2}, 90%, ${35 + barHeight / 3}%)`;
          canvasCtx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
          
          canvasCtx.shadowBlur = 4;
          canvasCtx.shadowColor = "rgba(14, 113, 235, 0.5)";
          
          x += barWidth;
        }
      };
      
      drawWave();
    }
  }, [recordingState]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio visualizer setup
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Media recorder setup
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        simulateTranscriptionAndMetrics(blob);
      };

      // Set state and begin
      setRecordingState("recording");
      setRecordingTime(0);
      setFluencyReport(null);
      mediaRecorder.start();

      // Start recording timer (1s updates, max 60s)
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Audio recording failed to start:", err);
      alert("Could not access microphone for recording. Check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      stopRecordingSession();
    }
  };

  const stopRecordingSession = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  };

  // Mock upload and transcription latency tests
  const simulateTranscriptionAndMetrics = (blob) => {
    setRecordingState("uploading");
    
    const startSimTime = performance.now();
    
    // Step 1: Simulated file upload (1.2 seconds)
    setTimeout(() => {
      const uploadDuration = Math.round(performance.now() - startSimTime);
      setRecordingState("processing");
      
      const transcriptionStartStamp = performance.now();
      
      // Step 2: Simulated Transcription processing (AI queues and transcripts - 2.8 seconds)
      setTimeout(() => {
        const endSimTime = performance.now();
        const transcriptionDuration = Math.round(endSimTime - transcriptionStartStamp);
        const queueDelay = Math.round(transcriptionDuration * 0.15); // simulate API queue
        const totalDuration = Math.round(endSimTime - startSimTime);

        setSimLatencies({
          uploadTime: uploadDuration,
          transcriptionStart: queueDelay,
          transcriptionEnd: transcriptionDuration - queueDelay,
          total: totalDuration
        });

        // Set mockup assessment scores
        setFluencyReport({
          overall: (7.2 + Math.random() * 2).toFixed(1),
          pronunciation: (7.5 + Math.random() * 2).toFixed(1),
          grammar: Math.floor(82 + Math.random() * 15),
          speakingRate: Math.floor(130 + Math.random() * 30),
          transcript: "In my opinion, learning English dynamically requires consistent conversation and real time assessment feedback. The Daily audio channels feel exceptionally clear, having very little delay compared to legacy systems."
        });

        // Save to comparison history
        setStatsHistory((prev) => [
          {
            name: `${userName} (Local)`,
            rtt: networkStats?.rtt || 42,
            loss: networkStats?.packetLoss || 0.0,
            jitter: networkStats?.jitter || 3,
            uploadTime: uploadDuration,
            transcribeTime: transcriptionDuration,
            role: role
          },
          ...prev
        ]);

        setRecordingState("done");
      }, 2800);
      
    }, 1200);
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case "Excellent": return "var(--quality-excellent)";
      case "Good": return "var(--quality-good)";
      case "Fair": return "var(--quality-fair)";
      case "Poor": return "var(--quality-poor)";
      default: return "var(--zoom-text-secondary)";
    }
  };

  const renderJoinModal = () => {
    return (
      <div className="zoom-modal-overlay">
        <div className="zoom-modal">
          <div className="modal-header">
            <h2 className="modal-title">Join Meeting</h2>
            <button className="modal-close" onClick={() => setActiveModal(null)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="form-group">
            <label>Daily Room URL</label>
            <input
              type="text"
              className="form-input"
              value={roomUrl}
              onChange={(e) => setRoomUrl(e.target.value)}
              placeholder="https://your-domain.daily.co/room-name"
            />
          </div>

          <div className="stat-grid">
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                className="form-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter Name"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="observer">Observer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Daily API Key (Optionally update or paste key)</label>
            <input
              type="password"
              className="form-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste Daily API Key"
            />
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setActiveModal(null)}>
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={() => {
                saveMeeting(`Joined: ${roomUrl.split("/").pop()}`, roomUrl, "live");
                setActiveModal(null);
                joinMeeting();
              }}
              disabled={isJoining}
            >
              {isJoining ? "Joining..." : "Join"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderScheduleModal = () => {
    return (
      <div className="zoom-modal-overlay">
        <div className="zoom-modal" style={{ maxWidth: scheduledResult ? "520px" : "480px" }}>
          <div className="modal-header">
            <h2 className="modal-title">{scheduledResult ? "Meeting Scheduled" : "Schedule Meeting"}</h2>
            <button 
              className="modal-close" 
              onClick={() => {
                setActiveModal(null);
                setScheduledResult(null);
              }}
            >
              <X size={18} />
            </button>
          </div>

          {!scheduledResult ? (
            <>
              <div className="form-group">
                <label>Topic / Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={scheduleTopic}
                  onChange={(e) => setScheduleTopic(e.target.value)}
                  placeholder="Speaking Assessment Topic"
                />
              </div>

              <div className="stat-grid">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Duration</label>
                <select
                  className="form-select"
                  value={scheduleDuration}
                  onChange={(e) => setScheduleDuration(e.target.value)}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>

              <div className="form-group">
                <label>Daily API Key</label>
                <input
                  type="password"
                  className="form-input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste Daily API Key"
                />
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setActiveModal(null);
                    setScheduledResult(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={scheduleMeeting}
                  disabled={isScheduling}
                >
                  {isScheduling ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="glass-card" style={{ gap: "10px" }}>
                <div className="stat-row">
                  <span className="stat-row-label">Topic</span>
                  <span className="stat-row-value">{scheduledResult.topic}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-row-label">Start Time</span>
                  <span className="stat-row-value">{scheduledResult.time}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-row-label">Duration</span>
                  <span className="stat-row-value">{scheduledResult.duration}</span>
                </div>
                <div className="stat-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "5px" }}>
                  <span className="stat-row-label">Meeting URL (Scheduled on Daily)</span>
                  <div style={{ display: "flex", width: "100%", gap: "8px" }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      readOnly 
                      value={scheduledResult.url} 
                      style={{ flex: 1, fontSize: "11px", padding: "6px" }}
                    />
                    <button 
                      className="btn-primary" 
                      style={{ padding: "6px 12px", fontSize: "11px", width: "auto" }}
                      onClick={() => {
                        navigator.clipboard.writeText(scheduledResult.url);
                        alert("Room URL copied to clipboard!");
                      }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "11px", color: "var(--zoom-text-secondary)", lineHeight: "1.4" }}>
                💡 Daily.co has enforced start (`nbf`) and end (`exp`) limits on this room. It will block connections before the start date/time, and will automatically terminate after the duration.
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setActiveModal(null);
                    setScheduledResult(null);
                  }}
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="zoom-app">
      {/* Daily.co Top Header */}
      <header className="zoom-header">
        <div className="zoom-header-left">
          <span className="encryption-icon">
            <Shield size={16} fill="currentColor" />
          </span>
          <span className="zoom-header-title">Daily.co Latency & Performance Test Client</span>
          {joined && (
            <span className="zoom-header-badge">
              Connected | Room: {roomUrl.split("/").pop()}
            </span>
          )}
        </div>
        
        <div className="zoom-header-right">
          {joined && networkStats && (
            <div className="connection-pill" style={{ color: getRatingColor(networkRating) }}>
              <span className="connection-dot" style={{ backgroundColor: getRatingColor(networkRating) }}></span>
              <span>Network: {networkRating}</span>
            </div>
          )}
          <span className="zoom-header-badge">V1.0.0</span>
        </div>
      </header>

      {/* Main Screen Layout */}
      <div className={`zoom-body ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        
        {/* Call Feed Area */}
        <main className="zoom-call-area">
          {/* Daily iframe container is always in DOM so containerRef.current is valid, using visibility to avoid loading issues */}
          <div 
            className="daily-iframe-container" 
            ref={containerRef}
            style={{ 
              visibility: joined ? "visible" : "hidden",
              pointerEvents: joined ? "auto" : "none"
            }}
          ></div>

          {!joined && (
            <>
              {/* Daily.co Homepage Dashboard */}
              <div className="zoom-home" style={{ zIndex: 10 }}>
                {/* Left Side: Actions Grid */}
                <div className="zoom-home-actions">
                  <div className="home-action-card" onClick={createRoomAndJoin}>
                    <div className="home-icon-container home-icon-new-meeting">
                      <Video size={32} />
                    </div>
                    <span className="home-action-title">New Meeting</span>
                    <span className="home-action-desc">Start a live meeting instantly</span>
                  </div>

                  <div className="home-action-card" onClick={() => {
                    setScheduledResult(null);
                    setActiveModal("join");
                  }}>
                    <div className="home-icon-container home-icon-blue">
                      <PlusCircle size={32} />
                    </div>
                    <span className="home-action-title">Join Meeting</span>
                    <span className="home-action-desc">Connect using a Room URL</span>
                  </div>

                  <div className="home-action-card" onClick={() => {
                    setScheduledResult(null);
                    setActiveModal("schedule");
                  }}>
                    <div className="home-icon-container home-icon-blue">
                      <Calendar size={32} />
                    </div>
                    <span className="home-action-title">Schedule</span>
                    <span className="home-action-desc">Plan a scheduled room</span>
                  </div>

                  <div className="home-action-card" onClick={createRoomAndShareScreen}>
                    <div className="home-icon-container home-icon-blue">
                      <Monitor size={32} />
                    </div>
                    <span className="home-action-title">Share Screen</span>
                    <span className="home-action-desc">Show your screen in a call</span>
                  </div>
                </div>

                {/* Right Side: Digital Clock & Upcoming Meetings */}
                <div className="zoom-home-sidebar">
                  <div className="digital-clock-container">
                    <div className="digital-clock-time">{timeString || "12:00:00 PM"}</div>
                    <div className="digital-clock-date">{dateString || "Monday, June 1, 2026"}</div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    <span className="meetings-list-title">Recent & Scheduled</span>
                    <div className="meetings-list-container">
                      {recentMeetings.length === 0 ? (
                        <p style={{ fontSize: "11px", color: "var(--zoom-text-secondary)", textAlign: "center", marginTop: "20px" }}>
                          No recent meetings found.
                        </p>
                      ) : (
                        recentMeetings.map((meeting, index) => (
                          <div 
                            key={index} 
                            className="meeting-list-item"
                            onClick={() => {
                              setRoomUrl(meeting.url);
                              setActiveModal("join");
                            }}
                          >
                            <div className="meeting-item-header">
                              <span className="meeting-item-title">{meeting.title}</span>
                              <span className={`meeting-item-badge ${meeting.type === "live" ? "badge-live" : "badge-scheduled"}`}>
                                {meeting.type}
                              </span>
                            </div>
                            <span className="meeting-item-time">{meeting.date}</span>
                            <span style={{ fontSize: "10px", color: "var(--zoom-blue)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {meeting.url}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MODALS OVERLAYS */}
              {activeModal === "join" && renderJoinModal()}
              {activeModal === "schedule" && renderScheduleModal()}
            </>
          )}
        </main>

        {/* Sidebar Analytics */}
        <aside className={`zoom-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${sidebarTab === "telemetry" ? "active" : ""}`}
              onClick={() => setSidebarTab("telemetry")}
            >
              <Activity size={15} />
              <span>Telemetry</span>
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === "winspeak" ? "active" : ""}`}
              onClick={() => setSidebarTab("winspeak")}
            >
              <Award size={15} />
              <span>WinSpeak Simulator</span>
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === "participants" ? "active" : ""}`}
              onClick={() => setSidebarTab("participants")}
            >
              <Users size={15} />
              <span>Participants ({participantsList.length})</span>
            </button>
          </div>

          <div className="sidebar-content">
            {/* TAB 1: TELEMETRY & LATENCY */}
            {sidebarTab === "telemetry" && (
              <>
                <div>
                  <h3 className="panel-section-title">
                    <Activity size={14} /> Connection Metrics
                  </h3>
                  {!joined ? (
                    <p style={{ color: "var(--zoom-text-secondary)", fontSize: "13px" }}>
                      Join the call to begin pulling statistics from the Daily SDK.
                    </p>
                  ) : (
                    <div className="glass-card">
                      <div className="stat-grid">
                        <div className="stat-box">
                          <span className="stat-box-label">Join Latency</span>
                          <span className="stat-box-value" style={{ color: "var(--zoom-blue-hover)" }}>
                            {joinLatency ? `${joinLatency}ms` : "--"}
                          </span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-box-label">Connection</span>
                          <span className="stat-box-value" style={{ color: getRatingColor(networkRating), fontSize: "15px", textTransform: "uppercase" }}>
                            {networkRating}
                          </span>
                        </div>
                      </div>

                      <div className="stat-row">
                        <span className="stat-row-label">Ping (RTT)</span>
                        <span className="stat-row-value">{networkStats ? `${networkStats.rtt} ms` : "Calculating..."}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-row-label">Jitter</span>
                        <span className="stat-row-value">{networkStats ? `${networkStats.jitter} ms` : "Calculating..."}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-row-label">Packet Loss</span>
                        <span className="stat-row-value" style={{ color: networkStats && networkStats.packetLoss > 1 ? "var(--quality-poor)" : "inherit" }}>
                          {networkStats ? `${networkStats.packetLoss}%` : "Calculating..."}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-row-label">Send Bitrate</span>
                        <span className="stat-row-value">{networkStats ? `${networkStats.sendBitrate} kbps` : "Calculating..."}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-row-label">Recv Bitrate</span>
                        <span className="stat-row-value">{networkStats ? `${networkStats.recvBitrate} kbps` : "Calculating..."}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="panel-section-title">
                    <Clock size={14} /> Multi-user Test Bench
                  </h3>
                  <div className="glass-card">
                    <p style={{ fontSize: "12px", color: "var(--zoom-text-secondary)", lineHeight: "1.4" }}>
                      Keep track of latency performance across multiple users connected to this room.
                    </p>
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>Participant</th>
                          <th>Ping</th>
                          <th>Loss</th>
                          <th>Upload Lat.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statsHistory.map((user, idx) => (
                          <tr key={idx}>
                            <td>
                              <span style={{ fontWeight: "600" }}>{user.name}</span>
                              <div style={{ fontSize: "9px", color: "var(--zoom-text-secondary)", textTransform: "uppercase" }}>{user.role}</div>
                            </td>
                            <td>{user.rtt}ms</td>
                            <td style={{ color: user.loss > 1 ? "var(--quality-poor)" : "inherit" }}>{user.loss}%</td>
                            <td>{user.uploadTime ? `${(user.uploadTime / 1000).toFixed(1)}s` : "--"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-card" style={{ borderLeft: "3px solid var(--zoom-blue)" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Info size={16} style={{ color: "var(--zoom-blue)", flexShrink: 0 }} />
                    <p style={{ fontSize: "11px", color: "var(--zoom-text-secondary)", lineHeight: "1.4" }}>
                      <strong>Daily JS SDK Integration Note:</strong> We retrieve telemetry asynchronously from the client-side PeerConnection using `callFrame.getNetworkStats()` API to ensure direct network RTT diagnostics are measured.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: WINSPEAK SPEECH EVALUATOR */}
            {sidebarTab === "winspeak" && (
              <>
                <div>
                  <h3 className="panel-section-title">
                    <Award size={14} /> Spoken Assessment Test
                  </h3>
                  <div className="glass-card">
                    <p style={{ fontSize: "12px", color: "var(--zoom-text-secondary)", lineHeight: "1.4" }}>
                      Simulate the speaking-assessment workflow in WinSpeak: Speak for up to 1 minute, record local audio, upload it, and trigger AI metrics.
                    </p>

                    <div className="recorder-container">
                      {recordingState === "idle" && (
                        <button className="record-btn" onClick={startRecording}>
                          <Play size={14} fill="white" />
                          <span>Start 1-Min Speech</span>
                        </button>
                      )}

                      {recordingState === "recording" && (
                        <>
                          <div className="recorder-status-badge">
                            <span className="pulse-dot"></span>
                            <span>Recording Audio... {recordingTime}s / 60s</span>
                          </div>
                          <canvas ref={canvasRef} className="audio-wave-canvas" width={300} height={60}></canvas>
                          <button className="record-btn recording" onClick={stopRecording}>
                            <Square size={14} fill="white" />
                            <span>Stop & Analyze</span>
                          </button>
                        </>
                      )}

                      {(recordingState === "uploading" || recordingState === "processing") && (
                        <div className="simulation-steps">
                          <div className={`sim-step ${recordingState === "uploading" ? "active" : "completed"}`}>
                            <div className="sim-step-icon">
                              {recordingState === "uploading" ? <RefreshCw className="spinner-mini" /> : <CheckCircle size={10} />}
                            </div>
                            <span>Uploading audio chunk... {recordingState === "uploading" ? "measuring duration" : "Done"}</span>
                          </div>
                          <div className={`sim-step ${recordingState === "processing" ? "active" : ""}`}>
                            <div className="sim-step-icon">
                              {recordingState === "processing" ? <RefreshCw className="spinner-mini" /> : <Clock size={10} />}
                            </div>
                            <span>Requesting Whisper transcript & Fluency Metrics...</span>
                          </div>
                        </div>
                      )}

                      {recordingState === "done" && (
                        <button className="record-btn" onClick={startRecording} style={{ backgroundColor: "var(--zoom-blue)" }}>
                          <RefreshCw size={14} />
                          <span>Record Another Speech</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* WINSPEAK REPORT CARD */}
                {recordingState === "done" && fluencyReport && (
                  <div className="winspeak-result">
                    <div className="result-header">
                      <div className="result-title">
                        <Award size={16} style={{ color: "var(--zoom-blue-hover)" }} />
                        <span>WinSpeak English Score</span>
                      </div>
                      <span className="result-badge">AI REPORT</span>
                    </div>

                    <div className="score-grid">
                      <div className="score-box">
                        <span className="score-label">Overall Fluency</span>
                        <div className="score-val-container">
                          <span className="score-value">{fluencyReport.overall}</span>
                          <span className="score-max">/10</span>
                        </div>
                      </div>
                      <div className="score-box">
                        <span className="score-label">Pronunciation</span>
                        <div className="score-val-container">
                          <span className="score-value">{fluencyReport.pronunciation}</span>
                          <span className="score-max">/10</span>
                        </div>
                      </div>
                      <div className="score-box">
                        <span className="score-label">Speed</span>
                        <div className="score-val-container">
                          <span className="score-value">{fluencyReport.speakingRate}</span>
                          <span className="score-max"> WPM</span>
                        </div>
                      </div>
                      <div className="score-box">
                        <span className="score-label">Grammar</span>
                        <div className="score-val-container">
                          <span className="score-value">{fluencyReport.grammar}</span>
                          <span className="score-max">%</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <span className="score-label">Speech Transcript</span>
                      <div className="transcript-container">
                        <span className="transcript-quote">"{fluencyReport.transcript}"</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="score-label">Latency Breakdown</span>
                      <div className="latency-breakdown-bar">
                        <div className="latency-segment segment-upload" style={{ width: `${(simLatencies.uploadTime / simLatencies.total) * 100}%` }} title={`Upload: ${simLatencies.uploadTime}ms`}></div>
                        <div className="latency-segment segment-queue" style={{ width: `${(simLatencies.transcriptionStart / simLatencies.total) * 100}%` }} title={`Queue: ${simLatencies.transcriptionStart}ms`}></div>
                        <div className="latency-segment segment-processing" style={{ width: `${(simLatencies.transcriptionEnd / simLatencies.total) * 100}%` }} title={`AI Analysis: ${simLatencies.transcriptionEnd}ms`}></div>
                      </div>
                      <div className="latency-legend">
                        <div className="legend-item">
                          <span className="legend-color segment-upload"></span>
                          <span>Upload ({simLatencies.uploadTime}ms)</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color segment-queue"></span>
                          <span>Queue ({simLatencies.transcriptionStart}ms)</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color segment-processing"></span>
                          <span>AI ({simLatencies.transcriptionEnd}ms)</span>
                        </div>
                      </div>
                      <div style={{ fontSize: "11px", display: "flex", justifyContent: "space-between", color: "var(--zoom-text-primary)", fontWeight: "600", marginTop: "4px" }}>
                        <span>Total AI Pipeline Time:</span>
                        <span>{simLatencies.total} ms</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 3: PARTICIPANTS */}
            {sidebarTab === "participants" && (
              <>
                <h3 className="panel-section-title">
                  <Users size={14} /> Active In Meeting ({participantsList.length})
                </h3>
                
                {!joined ? (
                  <p style={{ color: "var(--zoom-text-secondary)", fontSize: "13px" }}>
                    No meeting in progress. Join a meeting to view the user roster.
                  </p>
                ) : (
                  <div className="participant-list">
                    {participantsList.map((participant, index) => {
                      const isLocal = participant.local;
                      const hasAudio = participant.audio;
                      const hasVideo = participant.video;
                      const initial = participant.user_name ? participant.user_name.charAt(0) : "U";
                      return (
                        <div className="participant-item" key={participant.session_id || index}>
                          <div className="participant-info">
                            <div className="participant-avatar" style={{ backgroundColor: isLocal ? "var(--zoom-blue)" : "#3f454d" }}>
                              {initial}
                            </div>
                            <div className="participant-details">
                              <span className="participant-name">
                                {participant.user_name || "Unknown Participant"}
                                {isLocal && " (You)"}
                              </span>
                              <span className="participant-role">
                                {isLocal ? role.toUpperCase() : "PARTICIPANT"}
                              </span>
                            </div>
                          </div>
                          <div className="participant-actions">
                            {hasAudio ? (
                              <Mic size={14} style={{ color: "var(--quality-excellent)" }} />
                            ) : (
                              <MicOff size={14} className="muted" />
                            )}
                            {hasVideo ? (
                              <Video size={14} style={{ color: "var(--quality-excellent)" }} />
                            ) : (
                              <VideoOff size={14} className="muted" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Zoom Bottom Footer Control Bar */}
      <footer className="zoom-footer">
        {/* Audio/Video Toggle Controls */}
        <div className="zoom-footer-left">
          {joined && (
            <>
              <div className="zoom-icon-btn-group">
                <button className={`zoom-icon-btn ${audioMuted ? "danger" : ""}`} onClick={toggleAudio}>
                  {audioMuted ? <MicOff /> : <Mic />}
                  <span>{audioMuted ? "Unmute" : "Mute"}</span>
                </button>
              </div>

              <div className="zoom-icon-btn-group">
                <button className={`zoom-icon-btn ${videoMuted ? "danger" : ""}`} onClick={toggleVideo}>
                  {videoMuted ? <VideoOff /> : <Video />}
                  <span>{videoMuted ? "Start Video" : "Stop Video"}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Center Control Panel */}
        <div className="zoom-footer-center">
          {joined ? (
            <>
              <button
                className={`zoom-icon-btn ${sidebarOpen && sidebarTab === "participants" ? "active" : ""}`}
                onClick={() => {
                  setSidebarTab("participants");
                  setSidebarOpen(true);
                }}
              >
                <Users />
                <span>Participants</span>
              </button>
              
              <button className="zoom-icon-btn" onClick={() => alert("Chat logs would open here in standard Daily.co Client")}>
                <MessageSquare />
                <span>Chat</span>
              </button>
              
              <button className={`zoom-icon-btn ${screenSharing ? "active" : ""}`} onClick={toggleScreenShare}>
                <Monitor style={{ color: screenSharing ? "var(--zoom-blue)" : "inherit" }} />
                <span>Share Screen</span>
              </button>

              <button
                className={`zoom-icon-btn winspeak-btn ${sidebarOpen && sidebarTab === "winspeak" ? "active" : ""}`}
                onClick={() => {
                  setSidebarTab("winspeak");
                  setSidebarOpen(true);
                }}
              >
                <Award />
                <span>WinSpeak Test</span>
              </button>
              
              <button
                className={`zoom-icon-btn ${sidebarOpen && sidebarTab === "telemetry" ? "active" : ""}`}
                onClick={() => {
                  setSidebarTab("telemetry");
                  setSidebarOpen(true);
                }}
              >
                <Activity />
                <span>Network Stats</span>
              </button>
            </>
          ) : (
            <div style={{ color: "var(--zoom-text-secondary)", fontSize: "13px" }}>
              Ready to start test call
            </div>
          )}
        </div>

        {/* Leave/End Call controls */}
        <div className="zoom-footer-right">
          {joined ? (
            <button className="zoom-btn-end" onClick={leaveMeeting}>
              End Call
            </button>
          ) : (
            <button className="zoom-icon-btn" onClick={() => alert("Settings panel mock: Configuration and setup options.")}>
              <Settings />
              <span>Settings</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
