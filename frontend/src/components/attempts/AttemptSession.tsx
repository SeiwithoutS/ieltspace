import {focusAttemptQuestion} from "./focus-question";
import AttemptConfirmation, {
  type ConfirmationKind,
} from "./AttemptConfirmation";
import React, { useEffect, useRef, useState } from "react";
import StartTestDialog from "./StartTestDialog";
import { getAuthUser, navigate } from "../../lib/auth";
import "./attempt.css";

export { default as Popup } from "./Popup";
import Popup from "./Popup";

import type { AttemptMode, Snapshot, ScreenProps } from "./types";
import { parseAttemptDraft } from "../../lib/attempt-draft";
function readDraft(key: string) {
  try {
    return parseAttemptDraft(sessionStorage.getItem(key));
  } catch {
    return null;
  }
}
export default function AttemptSession({
  page,
  Screen,
}: {
  page: string;
  Screen: React.ComponentType<ScreenProps>;
}) {
  const skill = page.replace("Test", "");
  const query = new URLSearchParams(location.hash.split("?")[1]);
  const key = JSON.stringify([
    "ieltspace-draft",
    getAuthUser()?.id,
    page,
    query.get("examId"),
  ]);
  const [draft] = useState(() => readDraft(key));
  const [options, setOptions] = useState(draft?.options);
  const [dialog, setDialog] = useState<ConfirmationKind | "start" | "">(
    draft ? "" : "start",
  );
  const [seconds, setSeconds] = useState(draft?.seconds ?? 0);
  const snapshot = useRef<Snapshot>({ state: draft?.state, model: null });
  const started = useRef(Date.now());
  const initial = useRef(draft?.seconds ?? 0);
  const real = options?.mode === "real";
  const written = ["Writing", "Speaking"].includes(skill);
  useEffect(() => {
    if (!options) return;
    started.current = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - started.current) / 1000);
      const value = real
        ? Math.max(0, initial.current - elapsed)
        : initial.current + elapsed;
      setSeconds(value);
      if (real && value === 0) setDialog("expired");
    };
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [options, real]);
  useEffect(() => {
    if (!options) return;
    function offline() {
      setDialog((current) => (current === "expired" ? current : "offline"));
    }
    function online() {
      setDialog((current) => (current === "offline" ? "" : current));
    }
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, [options]);
  function exit() {
    navigate(
      "ExamDetail" +
        (query.has("examId")
          ? "?examId=" + encodeURIComponent(query.get("examId") || "")
          : ""),
    );
  }
  function finish() {
    if (!options) return;
    sessionStorage.removeItem(key);
    navigate(
      written
        ? "MyWS"
        : "ResultLR?skill=" + skill.toLowerCase() + "&mode=" + options.mode,
    );
  }
  function save() {
    if (!options) return;
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({ options, seconds, state: snapshot.current.state }),
      );
      exit();
    } catch {
      setDialog("saveError");
    }
  }
  const time =
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0");
  return (
    <>
      {options && (
        <Screen
          onSnapshot={(value) => {
            snapshot.current = value;
          }}
          initialState={draft?.state}
          timeText={time}
          task={(options.parts[0] ?? 0) + 1}
          selectedParts={options.parts}
          cheDo={
            skill === "Speaking"
              ? real
                ? "Bài thi đầy đủ"
                : "Luyện tập"
              : options.mode
          }
          onExit={() => setDialog("exit")}
          onSubmit={() => setDialog("submit")}
        />
      )}
      {dialog === "start" && (
        <Popup title="Bắt đầu làm bài" onCancel={exit}>
          <StartTestDialog
            skill={
              page === "ReadingTest"
                ? "reading"
                : page === "ListeningTest"
                  ? "listening"
                  : page === "WritingTest"
                    ? "writing"
                    : "speaking"
            }
            title={skill}
            onClose={exit}
            onStart={(mode: AttemptMode, parts: number[]) => {
              initial.current =
                mode === "real"
                  ? (
                      {
                        Speaking: 14,
                        Listening: 30,
                        Writing: 60,
                        Reading: 60,
                      } as Record<string, number>
                    )[skill] * 60
                  : 0;
              setSeconds(initial.current);
              setOptions({ mode, parts });
              setDialog("");
            }}
          />
        </Popup>
      )}
      {options && dialog && dialog !== "start" && (
        <Popup
          labelledBy="attempt-confirm-title"
          title={skill}
          onCancel={dialog === "expired" ? undefined : () => setDialog("")}
        >
          <AttemptConfirmation
            kind={dialog}
            skill={skill}
            real={real}
            model={dialog === "submit" ? snapshot.current.model : null}
            back={() => setDialog("")}
            save={save}
            finish={finish}
            jump={(n) => {
              setDialog("");
              requestAnimationFrame(()=>focusAttemptQuestion(n));
            }}
          />
        </Popup>
      )}
    </>
  );
}
