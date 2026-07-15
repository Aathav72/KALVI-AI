"use client";
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Mic,
  Square,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckCircle,
  HelpCircle,
  BookOpen,
  List,
  Sparkles,
  ClipboardList,
  Upload,
  FileAudio,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

const LANG_LABELS = {
  en: 'English', hi: 'हिन्दी', ta: 'தமிழ்', te: 'తెలుగు',
  kn: 'ಕನ್ನಡ', ml: 'മലയാളം', mr: 'मराठी', bn: 'বাংলা',
  gu: 'ગુજરાતી', es: 'Español', fr: 'Français', zh: '中文',
};

export default function ActiveSession({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [sessionData, setSessionData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [recordTime, setRecordTime] = useState(0);
  const [copiedSection, setCopiedSection] = useState(null);
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'
  const [typedQuestion, setTypedQuestion] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    question: true,
    explanation: true,
    summary: true,
    examples: true,
    tips: true,
    quiz: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.from('sessions').select('*').eq('id', id).single();
      if (data) setSessionData(data);
    };
    fetchSession();
  }, [id]);

  // Recording Timer effect
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getStepIndex = () => {
    if (status === 'Ready') return 0;
    if (status === 'Recording…') return 1;
    if (status === 'Transcribing audio…') return 2;
    if (status === 'Generating AI explanation & quiz…') return 3;
    if (status === 'Saving session…') return 4;
    if (status.startsWith('✅')) return 5;
    return 0;
  };

  const steps = [
    { label: 'Ready', desc: 'Mic ready' },
    { label: 'Record', desc: 'Speaking' },
    { label: 'Transcribe', desc: 'Audio conversion' },
    { label: 'AI Brain', desc: 'Generation' },
    { label: 'Saving', desc: 'To cloud' },
    { label: 'Complete', desc: 'Done!' }
  ];

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setRecordTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
          channelCount: 1,
        }
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop stream tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log("Audio Blob Size:", audioBlob.size);
        console.log("Audio Blob Type:", audioBlob.type);

        if (audioBlob.size < 1000) {
          setStatus('⚠️ Audio too short. Hold the mic button while speaking, then release.');
          setTimeout(() => setStatus('Ready'), 4000);
          return;
        }

        setStatus('Transcribing audio…');
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("language", sessionData?.language || "en");

        fetch('/api/transcribe', { method: 'POST', body: formData })
          .then((res) => res.json())
          .then((data) => {
            if (!data.transcript) throw new Error(data.error || 'No transcript returned');
            processTranscript(data.transcript.trim());
          })
          .catch((err) => {
            console.error('[transcribe] error:', err);
            setStatus(`⚠️ ${err.message}`);
            setTimeout(() => setStatus('Ready'), 5000);
          });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('Recording… speak now');
    } catch (err) {
      console.error('[mic] error:', err);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('⚠️ Microphone permission denied. Allow mic in browser settings.');
      } else {
        setStatus(`⚠️ Could not start microphone: ${err.message}`);
      }
      setTimeout(() => setStatus('Ready'), 4000);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setUploadError(null);

    if (!file.type.startsWith('audio/')) {
      setUploadError('Please select a valid audio file.');
      return;
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('Audio file is too large. Groq Whisper limit is 25MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isBusy) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isBusy) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleUploadAndTranscribe = async () => {
    if (!selectedFile) return;

    setStatus('Transcribing audio…');
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("audio", selectedFile);
      formData.append("language", sessionData?.language || "en");

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      if (!data.transcript) {
        throw new Error('No transcript returned from transcription service.');
      }

      setSelectedFile(null);
      await processTranscript(data.transcript.trim());
    } catch (err) {
      console.error('[upload-transcribe] error:', err);
      setUploadError(err.message);
      setStatus(`⚠️ ${err.message}`);
      setTimeout(() => setStatus('Ready'), 5000);
    }
  };

  const processTranscript = async (transcript) => {
    console.log('[speech] Processing transcript:', transcript);
    setStatus('Generating AI explanation & quiz…');

    try {
      // Generate AI content
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          grade: sessionData.grade,
          subject: sessionData.subject,
          language: sessionData.language,
        }),
      });

      const generateData = await generateRes.json();
      if (!generateRes.ok) throw new Error(generateData.error || 'AI generation failed');

      // 3. Save to Supabase
      setStatus('Saving session…');

      let { data: updatedSession, error } = await supabase
        .from('sessions')
        .update({
          question: transcript,
          ai_answer: generateData.explanation,
          quiz: generateData.quiz ?? [],
          examples: generateData.examples ?? [],
          tips: generateData.tips ?? [],
          summary: generateData.summary ?? '',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('[session] Falling back to base fields:', error.message);
        const fallback = await supabase
          .from('sessions')
          .update({
            question: transcript,
            ai_answer: generateData.explanation,
            quiz: generateData.quiz ?? [],
          })
          .eq('id', id)
          .select()
          .single();

        if (fallback.error) throw fallback.error;

        updatedSession = {
          ...fallback.data,
          examples: generateData.examples ?? [],
          tips: generateData.tips ?? [],
          summary: generateData.summary ?? '',
        };
      }

      setSessionData(updatedSession);
      setStatus('✅ Done! Check the projector screen.');
      setTimeout(() => setStatus('Ready'), 4000);

    } catch (err) {
      console.error('[speech] processTranscript error:', err);
      setStatus(`⚠️ ${err.message || 'Error occurred. Please try again.'}`);
      setTimeout(() => setStatus('Ready'), 5000);
    }
  };

  if (!sessionData) {
    return (
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center min-h-[80vh]">
        <p className="font-display text-2xl animate-pulse" style={{ color: 'rgba(248,248,242,0.5)' }}>
          ⏳ Loading session…
        </p>
      </div>
    );
  }

  const isBusy = status.includes('…') && !status.startsWith('Recording');
  const currentStepIdx = getStepIndex();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">

      {/* Session Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6" style={{ borderBottom: '1px solid rgba(248,248,242,0.1)' }}>
        <div className="space-y-1">
          <h1
            className="font-display text-2xl sm:text-3xl font-bold tracking-wider"
            style={{ color: '#F8E16C', textShadow: '0 0 10px rgba(248,225,108,0.4), 1px 1px 0 rgba(0,0,0,0.5)' }}
          >
            📚 {sessionData.subject} · Grade {sessionData.grade}
          </h1>
          <p className="font-handwritten text-xl tracking-wider" style={{ color: '#7FD6FF', textShadow: '0 0 6px rgba(127,214,255,0.3)' }}>
            🌐 Teaching in {LANG_LABELS[sessionData.language] || sessionData.language}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/session/new"
            id="change-settings-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded font-display tracking-wider text-sm transition-all duration-200"
            style={{ border: '1px solid rgba(248,248,242,0.25)', color: '#F8F8F2', background: 'rgba(0,0,0,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#F8E16C'; e.currentTarget.style.color = '#F8E16C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(248,248,242,0.25)'; e.currentTarget.style.color = '#F8F8F2'; }}
          >
            <ChevronLeft size={16} />
            <span>Change Settings</span>
          </Link>
          <Link
            href={`/projector/${id}`}
            target="_blank"
            id="open-projector-btn"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded font-display tracking-wider text-sm transition-all duration-200"
            style={{
              background: 'linear-gradient(to bottom, #A0703A, #8B5A2B, #5E3A1A)',
              border: '2px solid #3D1F0A',
              color: '#F8F8F2',
              boxShadow: '3px 3px 0 #3D1F0A, inset 0 1px 0 rgba(255,255,255,0.12)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
            }}
          >
            <ExternalLink size={16} />
            <span>🖥 Open Projector</span>
          </Link>
        </div>
      </div>

      {/* Progress Stepper Panel */}
      <div
        className="p-5 rounded-sm relative overflow-hidden"
        style={{ background: '#172E24', border: '1px solid #2E6B52', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
      >
        <div className="absolute inset-0 board-ruled opacity-40 pointer-events-none" />
        <p className="font-handwritten text-lg tracking-widest mb-4 relative z-10" style={{ color: '#7FD6FF' }}>📋 Lesson Progress</p>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-2 relative z-10">
          {steps.map((st, idx) => {
            const isActive = idx === currentStepIdx;
            const isCompleted = idx < currentStepIdx;
            return (
              <div key={idx} className="flex items-center gap-3 w-full md:w-auto">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full font-display text-sm transition-all duration-300"
                  style={{
                    border: `2px solid ${isActive ? '#F8E16C' : isCompleted ? '#7FD6FF' : '#2E6B52'}`,
                    background: isActive ? 'rgba(248,225,108,0.12)' : isCompleted ? 'rgba(127,214,255,0.08)' : 'rgba(23,46,36,0.6)',
                    color: isActive ? '#F8E16C' : isCompleted ? '#7FD6FF' : '#A8B5A0',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isActive ? '0 0 8px rgba(248,225,108,0.25)' : 'none',
                  }}
                >
                  {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                </div>
                <div className="flex flex-col text-left">
                  <span
                    className="font-display text-sm tracking-wide transition-colors duration-300"
                    style={{ color: isActive ? '#F8E16C' : isCompleted ? '#7FD6FF' : '#A8B5A0' }}
                  >
                    {st.label}
                  </span>
                  <span className="text-xs font-handwritten tracking-wider" style={{ color: 'rgba(168,181,160,0.7)' }}>{st.desc}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="hidden md:block h-0.5 flex-1 min-w-[24px] border-t-2 border-dashed mx-2 transition-colors duration-300"
                    style={{ borderColor: isCompleted ? '#7FD6FF' : '#2E6B52' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mic Input Controller Card */}
        <div className="bg-board-dark/95 board-grid border border-board-border rounded-lg p-8 flex flex-col items-center justify-center text-center shadow-chalk relative overflow-hidden">
          <p className="font-handwritten text-xl text-chalk-muted tracking-widest mb-6">
            {isRecording ? 'Tap the square to stop recording' : 'Tap the microphone below to ask a question'}
          </p>

          <div className="relative flex flex-col items-center justify-center">
            {isRecording && (
              <div className="absolute -inset-3 border border-chalk-pink/35 rounded-full animate-ping z-0" />
            )}

            <button
              id="mic-btn"
              className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition duration-300 relative z-10 focus:outline-none cursor-pointer chalk-rough
                ${isRecording
                  ? 'bg-chalk-pink/15 border-chalk-pink text-chalk-pink shadow-[0_0_20px_rgba(244,167,185,0.3)] animate-pulse'
                  : 'bg-board-light border-chalk-white text-chalk-white hover:scale-105 hover:border-chalk-yellow hover:text-chalk-yellow hover:shadow-chalk'
                }`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isBusy}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <>
                  <Square size={34} className="fill-chalk-pink text-chalk-pink" />
                  <span className="font-display text-xs font-semibold mt-2 tracking-widest">{formatTime(recordTime)}</span>
                </>
              ) : (
                <Mic size={34} className="stroke-[1.75]" />
              )}
            </button>

            <div
              className={`mt-6 font-handwritten text-xl tracking-wider flex items-center gap-2
                ${isRecording
                  ? 'text-chalk-pink font-semibold animate-pulse'
                  : status.startsWith('✅')
                    ? 'text-chalk-yellow font-semibold'
                    : status.startsWith('⚠️')
                      ? 'text-chalk-pink font-semibold'
                      : 'text-chalk-muted'
                }`}
            >
              {isBusy && <Loader2 className="animate-spin text-chalk-blue" size={20} />}
              <span>{status}</span>
            </div>
          </div>
        </div>

        {/* Audio Upload Controller Card */}
        <div className="bg-board-dark/95 board-grid border border-board-border rounded-lg p-8 flex flex-col justify-between shadow-chalk relative overflow-hidden">
          <div className="text-center md:text-left space-y-1 mb-4">
            <p className="font-handwritten text-xl text-chalk-muted tracking-widest">
              📁 Or upload an audio file:
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[160px] chalk-rough
              ${isDragging
                ? 'border-chalk-yellow bg-chalk-yellow/5'
                : 'border-board-border bg-board-light hover:border-chalk-blue'
              }
              ${isBusy ? 'opacity-40 cursor-not-allowed' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!isBusy) {
                document.getElementById('audio-file-input').click();
              }
            }}
          >
            <input
              type="file"
              id="audio-file-input"
              accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
              className="hidden"
              disabled={isBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />
            {selectedFile ? (
              <div className="space-y-3 flex flex-col items-center">
                <FileAudio className="text-chalk-yellow stroke-[1.5]" size={42} />
                <div className="space-y-1">
                  <p className="text-chalk-white font-body text-sm font-medium line-clamp-1 max-w-[250px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-chalk-muted font-body">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col items-center">
                <Upload className="text-chalk-muted stroke-[1.5]" size={42} />
                <p className="font-handwritten text-lg text-chalk-muted tracking-wide">
                  Drag & drop audio here or click to browse
                </p>
                <p className="text-xs text-chalk-muted/50 font-body">
                  Supports MP3, WAV, M4A, WEBM, OGG (Max 25MB)
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-4 p-2 bg-chalk-pink/10 border border-chalk-pink text-chalk-pink rounded text-xs font-handwritten text-base tracking-wide text-center">
              ⚠️ {uploadError}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              id="clear-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setUploadError(null);
              }}
              disabled={isBusy || !selectedFile}
              className="chalk-rough px-4 py-2.5 border-2 border-chalk-pink/50 text-chalk-pink hover:bg-chalk-pink/15 hover:border-chalk-pink rounded font-display tracking-wider text-xs transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
            <button
              id="transcribe-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleUploadAndTranscribe();
              }}
              disabled={isBusy || !selectedFile}
              className="chalk-rough flex-1 py-2.5 border-2 border-chalk-yellow bg-chalk-yellow text-board-dark hover:bg-transparent hover:text-chalk-yellow rounded shadow-chalk font-display tracking-wider text-xs transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isBusy && status.includes('Transcribing') ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Transcribing…</span>
                </>
              ) : (
                <span>🚀 Transcribe File</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Text Input Fallback */}
      <div
        className="board-ruled p-6 rounded space-y-4 relative overflow-hidden"
        style={{ background: '#172E24', border: '1px solid #2E6B52', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
      >
        <p className="font-handwritten text-lg tracking-widest" style={{ color: '#A8B5A0' }}>
          ✍️ Or type your question directly:
        </p>
        <textarea
          id="typed-question"
          value={typedQuestion}
          onChange={(e) => setTypedQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const q = typedQuestion.trim();
              if (q && !isBusy) { setTypedQuestion(''); processTranscript(q); }
            }
          }}
          placeholder="e.g. Explain photosynthesis for Grade 5 students…  (Enter to submit)"
          rows={3}
          disabled={isBusy}
          className="w-full rounded p-3 font-handwritten text-lg resize-none transition-all duration-200 disabled:opacity-40"
          style={{
            background: 'rgba(23,46,36,0.8)',
            border: '1px solid #2E6B52',
            color: '#F8F8F2',
            outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#F8E16C'; e.target.style.boxShadow = '0 0 0 2px rgba(248,225,108,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#2E6B52'; e.target.style.boxShadow = 'none'; }}
        />
        <button
          id="submit-typed-question"
          onClick={() => {
            const q = typedQuestion.trim();
            if (!q) return;
            setTypedQuestion('');
            processTranscript(q);
          }}
          disabled={isBusy || !typedQuestion.trim()}
          className="w-full py-3 rounded font-display tracking-widest text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(127,214,255,0.08)',
            border: '1px solid #7FD6FF',
            color: '#7FD6FF',
            textShadow: '0 0 6px rgba(127,214,255,0.3)',
          }}
        >
          {isBusy ? '⏳ Processing…' : '🚀 Submit Question'}
        </button>
      </div>

      {/* Response Display Section */}
      {sessionData.question && (
        <div className="space-y-6 animate-fade-in">

          {/* Transcribed Question Accordion */}
          <div className="bg-board-dark border border-board-border rounded-lg shadow-chalk overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleSection('question')}
              onKeyDown={(e) => e.key === 'Enter' && toggleSection('question')}
              className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer border-b border-board-border/30 hover:bg-board-light/20 transition duration-200"
            >
              <div className="flex items-center gap-2 font-display text-lg text-chalk-blue chalk-text">
                <HelpCircle size={20} />
                <span>🎤 Transcribed Question</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(sessionData.question, 'question');
                  }}
                  className="chalk-rough flex items-center justify-center gap-1.5 px-3 py-1 border border-chalk-muted text-chalk-muted hover:text-chalk-blue hover:border-chalk-blue rounded font-display text-xs transition duration-200 cursor-pointer"
                >
                  {copiedSection === 'question' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSection === 'question' ? 'Copied!' : 'Copy'}</span>
                </button>
                {expandedSections.question ? <ChevronUp size={20} className="text-chalk-blue" /> : <ChevronDown size={20} className="text-chalk-blue" />}
              </div>
            </div>
            {expandedSections.question && (
              <div className="p-6 transition-all duration-300 board-ruled">
                <p className="text-base sm:text-lg text-chalk-white leading-relaxed font-body pl-2">
                  {sessionData.question}
                </p>
              </div>
            )}
          </div>

          {/* AI Explanation Accordion */}
          <div className="bg-board-dark border border-board-border rounded-lg shadow-chalk overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleSection('explanation')}
              onKeyDown={(e) => e.key === 'Enter' && toggleSection('explanation')}
              className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer border-b border-board-border/30 hover:bg-board-light/20 transition duration-200"
            >
              <div className="flex items-center gap-2 font-display text-lg text-chalk-yellow chalk-text">
                <BookOpen size={20} />
                <span>🤖 AI Explanation</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(sessionData.ai_answer, 'explanation');
                  }}
                  className="chalk-rough flex items-center justify-center gap-1.5 px-3 py-1 border border-chalk-muted text-chalk-muted hover:text-chalk-yellow hover:border-chalk-yellow rounded font-display text-xs transition duration-200 cursor-pointer"
                >
                  {copiedSection === 'explanation' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSection === 'explanation' ? 'Copied!' : 'Copy'}</span>
                </button>
                {expandedSections.explanation ? <ChevronUp size={20} className="text-chalk-yellow" /> : <ChevronDown size={20} className="text-chalk-yellow" />}
              </div>
            </div>
            {expandedSections.explanation && (
              <div className="p-6 transition-all duration-300 board-ruled">
                <p className="text-sm sm:text-base text-chalk-white leading-relaxed font-body whitespace-pre-wrap pl-2">
                  {sessionData.ai_answer}
                </p>
              </div>
            )}
          </div>

          {/* Session Summary Accordion */}
          {sessionData.summary && (
            <div className="bg-board-dark border border-board-border rounded-lg shadow-chalk overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleSection('summary')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSection('summary')}
                className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer border-b border-board-border/30 hover:bg-board-light/20 transition duration-200"
              >
                <div className="flex items-center gap-2 font-display text-lg text-chalk-blue chalk-text">
                  <Sparkles size={20} />
                  <span>📄 Session Summary</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(sessionData.summary, 'summary');
                    }}
                    className="chalk-rough flex items-center justify-center gap-1.5 px-3 py-1 border border-chalk-muted text-chalk-muted hover:text-chalk-blue hover:border-chalk-blue rounded font-display text-xs transition duration-200 cursor-pointer"
                  >
                    {copiedSection === 'summary' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSection === 'summary' ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {expandedSections.summary ? <ChevronUp size={20} className="text-chalk-blue" /> : <ChevronDown size={20} className="text-chalk-blue" />}
                </div>
              </div>
              {expandedSections.summary && (
                <div className="p-6 transition-all duration-300 board-ruled">
                  <p className="text-sm sm:text-base text-chalk-white leading-relaxed font-body pl-2">
                    {sessionData.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Worked Examples Accordion */}
          {sessionData.examples && sessionData.examples.length > 0 && (
            <div className="bg-board-dark border border-board-border rounded-lg shadow-chalk overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleSection('examples')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSection('examples')}
                className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer border-b border-board-border/30 hover:bg-board-light/20 transition duration-200"
              >
                <div className="flex items-center gap-2 font-display text-lg text-chalk-pink chalk-text">
                  <ClipboardList size={20} />
                  <span>🛠️ Worked Examples</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const examplesText = sessionData.examples.map((ex, i) => `Example ${i + 1}: ${ex.question}\nSolution: ${ex.solution}`).join('\n\n');
                      copyToClipboard(examplesText, 'examples');
                    }}
                    className="chalk-rough flex items-center justify-center gap-1.5 px-3 py-1 border border-chalk-muted text-chalk-muted hover:text-chalk-pink hover:border-chalk-pink rounded font-display text-xs transition duration-200 cursor-pointer"
                  >
                    {copiedSection === 'examples' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSection === 'examples' ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {expandedSections.examples ? <ChevronUp size={20} className="text-chalk-pink" /> : <ChevronDown size={20} className="text-chalk-pink" />}
                </div>
              </div>
              {expandedSections.examples && (
                <div className="p-6 transition-all duration-300 space-y-4 board-grid">
                  {sessionData.examples.map((ex, idx) => (
                    <div key={idx} className="p-5 bg-board-dark/95 border-2 border-dashed border-board-border rounded-lg shadow-chalk chalk-rough">
                      <p className="font-display text-base text-chalk-yellow mb-2">
                        <strong>Example {idx + 1}:</strong> {ex.question}
                      </p>
                      <p className="text-sm text-chalk-white whitespace-pre-wrap font-body pl-2 leading-relaxed">
                        {ex.solution}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Teaching Tips Accordion */}
          {sessionData.tips && sessionData.tips.length > 0 && (
            <div className="bg-board-dark border border-board-border rounded-lg shadow-chalk overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleSection('tips')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSection('tips')}
                className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer border-b border-board-border/30 hover:bg-board-light/20 transition duration-200"
              >
                <div className="flex items-center gap-2 font-display text-lg text-chalk-yellow chalk-text">
                  <List size={20} />
                  <span>💡 Teaching Tips</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(sessionData.tips.join('\n'), 'tips');
                    }}
                    className="chalk-rough flex items-center justify-center gap-1.5 px-3 py-1 border border-chalk-muted text-chalk-muted hover:text-chalk-yellow hover:border-chalk-yellow rounded font-display text-xs transition duration-200 cursor-pointer"
                  >
                    {copiedSection === 'tips' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSection === 'tips' ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {expandedSections.tips ? <ChevronUp size={20} className="text-chalk-yellow" /> : <ChevronDown size={20} className="text-chalk-yellow" />}
                </div>
              </div>
              {expandedSections.tips && (
                <div className="p-6 transition-all duration-300 board-ruled">
                  <ul className="list-disc list-inside space-y-2 text-chalk-white pl-2">
                    {sessionData.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm sm:text-base font-body inline-block w-full">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quiz Preview Accordion */}
          {sessionData.quiz && sessionData.quiz.length > 0 && (
            <div className="bg-board-dark border border-board-border rounded-lg shadow-chalk overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleSection('quiz')}
                onKeyDown={(e) => e.key === 'Enter' && toggleSection('quiz')}
                className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer border-b border-board-border/30 hover:bg-board-light/20 transition duration-200"
              >
                <div className="flex items-center gap-2 font-display text-lg text-chalk-pink chalk-text">
                  <ClipboardList size={20} />
                  <span>📝 Generated Quiz Preview</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const quizText = sessionData.quiz.map((q, i) => {
                        const opts = q.options.map((o, oi) => `  ${String.fromCharCode(65 + oi)}. ${o}`).join('\n');
                        return `${i + 1}. ${q.question}\n${opts}\nCorrect Answer Index: ${q.answerIndex}`;
                      }).join('\n\n');
                      copyToClipboard(quizText, 'quiz');
                    }}
                    className="chalk-rough flex items-center justify-center gap-1.5 px-3 py-1 border border-chalk-muted text-chalk-muted hover:text-chalk-pink hover:border-chalk-pink rounded font-display text-xs transition duration-200 cursor-pointer"
                  >
                    {copiedSection === 'quiz' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSection === 'quiz' ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {expandedSections.quiz ? <ChevronUp size={20} className="text-chalk-pink" /> : <ChevronDown size={20} className="text-chalk-pink" />}
                </div>
              </div>
              {expandedSections.quiz && (
                <div className="p-6 transition-all duration-300 board-grid">
                  <div className="space-y-6">
                    {sessionData.quiz.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-6 bg-board-dark/95 border border-board-border rounded-xl space-y-4 shadow-chalk"
                      >
                        <p className="font-display text-base text-chalk-white tracking-wide">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.answerIndex;
                            return (
                              <div
                                key={oIdx}
                                className={`p-3.5 border-2 border-dashed rounded-lg font-handwritten text-2xl tracking-wider transition duration-200 cursor-default chalk-rough
                                  ${isCorrect
                                    ? 'border-chalk-yellow bg-chalk-yellow/10 text-chalk-yellow shadow-chalk font-semibold'
                                    : 'border-board-border bg-board-light text-chalk-muted hover:border-chalk-blue hover:text-chalk-white'
                                  }`}
                              >
                                <span className="font-display text-sm mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
