"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((event: {
        results: {
          length: number;
          [index: number]: {
            isFinal: boolean;
            [index: number]: {
              transcript: string;
            };
          };
        };
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type DictationTextareaProps = {
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
  defaultValue?: string | null;
  helperText?: string;
};

export default function DictationTextarea({
  name,
  label,
  rows = 3,
  placeholder,
  defaultValue,
  helperText,
}: DictationTextareaProps) {
  const [value, setValue] = useState(defaultValue || "");
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setStatusMessage(
        "In-app dictation is not available in this browser. Phone users can tap the keyboard microphone instead.",
      );
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];

        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        setValue((currentValue) =>
          [currentValue, finalTranscript.trim()].filter(Boolean).join(" "),
        );
      }
    };

    recognition.onerror = (event) => {
      setStatusMessage(`Dictation stopped: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  function startDictation() {
    if (!recognitionRef.current) return;

    setStatusMessage("Listening. Speak your short operational update.");
    setIsListening(true);
    recognitionRef.current.start();
  }

  function stopDictation() {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsListening(false);
    setStatusMessage("Dictation stopped. Review the note before saving.");
  }

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-300">
      <span>{label}</span>

      <span className="text-xs leading-5 text-slate-500">
        {helperText ||
          "Phone users: tap inside the box, then tap the keyboard microphone. Desktop users can use Start Dictation if available."}
      </span>

      <div className="flex flex-wrap gap-2">
        {isSupported ? (
          <>
            <button
              type="button"
              onClick={startDictation}
              disabled={isListening}
              className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start Dictation
            </button>

            <button
              type="button"
              onClick={stopDictation}
              disabled={!isListening}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stop
            </button>
          </>
        ) : null}
      </div>

      {statusMessage ? (
        <span className="text-xs text-slate-500">{statusMessage}</span>
      ) : null}

      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}
