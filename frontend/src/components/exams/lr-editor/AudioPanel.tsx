import React, { useState, useRef, useEffect } from 'react';
import type { LrPassageAudio, LrPassageState } from '../../../lib/lr-editor/types.ts';
import { uploadSkillAudio } from '../../../lib/exam-editor.ts';

export type AudioPanelProps = {
  passage: LrPassageState;
  skillId?: string;
  readOnly?: boolean;
  seekSec?: number | null;
  onChangeAudio: (audio: LrPassageState['audio']) => void;
};

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AudioPanel({
  passage,
  skillId,
  readOnly = false,
  seekSec,
  onChangeAudio,
}: AudioPanelProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const audio = passage.audio;
  const audioSrc = audio?.url || (audio && 'path' in audio ? audio.path : '');

  // Respond to seekSec from external clicks (e.g. transcript timestamps)
  useEffect(() => {
    if (seekSec != null && audioRef.current) {
      audioRef.current.currentTime = seekSec;
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [seekSec]);

  async function handleFileSelect(file: File) {
    if (!file.name.match(/\.(mp3|wav|m4a)$/i) && !file.type.startsWith('audio/')) {
      setUploadError('Vui lòng chọn tệp âm thanh định dạng MP3, WAV hoặc M4A.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Kích thước ghi âm tối đa 50 MB.');
      return;
    }

    setUploadError(null);
    setUploadProgress(0);

    try {
      if (!skillId) {
        // Local preview if skillId not set
        const url = URL.createObjectURL(file);
        const newAudio: LrPassageAudio = {
          name: file.name,
          url,
          path: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        };
        onChangeAudio(newAudio);
      } else {
        const res = await uploadSkillAudio(skillId, file, (pct) => {
          setUploadProgress(pct);
        });
        const newAudio: LrPassageAudio = {
          name: file.name,
          url: res.url,
          path: res.path,
          sizeBytes: res.sizeBytes,
          size: `${(res.sizeBytes / (1024 * 1024)).toFixed(1)} MB`,
        };
        onChangeAudio(newAudio);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải tệp ghi âm thất bại.';
      setUploadError(msg);
    } finally {
      setUploadProgress(null);
    }
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  function handleSkip(delta: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
  }

  function handleRateChange(rate: number) {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }

  function removeAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    onChangeAudio(null);
  }

  return (
    <div className="bg-white border border-solid border-[#E5E0D8] rounded-2xl p-4 space-y-3 shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase tracking-wide text-[#352637]">Ghi âm</span>
        <span className="text-[12px] text-[#706473]">Phát một lần khi thi thật</span>
      </div>
      {uploadError && (
        <div className="text-[12px] bg-[#FDF3F0] text-[#C0412A] border border-[#F2B8B5] px-3 py-1.5 rounded-lg flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError(null)} className="font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {audioSrc ? (
        <div className="space-y-2.5">
          {/* Audio Player Element */}
          <audio
            ref={audioRef}
            src={audioSrc}
            onTimeUpdate={() => {
              if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) setDuration(audioRef.current.duration);
            }}
            onEnded={() => setIsPlaying(false)}
          />

          {/* File info bar */}
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#2A1F2D]" />
              <span className="font-semibold text-[#352637] truncate max-w-[200px]" title={audio?.name}>
                {audio?.name}
              </span>
              {'size' in (audio || {}) && (
                <span className="text-[11px] text-[#706473]">({(audio as LrPassageAudio).size})</span>
              )}
            </div>

            {!readOnly && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#2963CC] hover:underline font-semibold text-[11px]"
                >
                  Thay tệp
                </button>
                <span className="text-[#D6D4D0]">|</span>
                <button
                  type="button"
                  onClick={removeAudio}
                  className="text-[#C0412A] hover:underline font-semibold text-[11px]"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Scrub bar & Time */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (audioRef.current) audioRef.current.currentTime = val;
              }}
              className="w-full h-1.5 bg-[#E5E0D8] rounded-lg appearance-none cursor-pointer accent-[#2A1F2D]"
            />
            <div className="flex justify-between text-[11px] text-[#706473] font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSkip(-5)}
                className="p-1.5 text-[#554756] hover:bg-[#F3F0EA] rounded-lg"
                title="Lùi 5 giây"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#2A1F2D] hover:bg-[#3D2F40] text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSkip(5)}
                className="p-1.5 text-[#554756] hover:bg-[#F3F0EA] rounded-lg"
                title="Tiến 5 giây"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1">
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors ${
                    playbackRate === rate
                      ? 'bg-[#2A1F2D] text-white'
                      : 'text-[#706473] hover:bg-[#F3F0EA]'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div>
          {uploadProgress !== null ? (
            <div className="p-4 border border-[#D6D4D0] rounded-xl bg-[#FAF9F7] space-y-2 text-center">
              <div className="text-[12px] font-semibold text-[#2A1F2D]">
                Đang tải tệp ghi âm lên ({uploadProgress}%)...
              </div>
              <div className="w-full h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2A1F2D] transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                if (!readOnly) fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed border-[#D6D4D0] hover:border-[#2A1F2D] rounded-xl p-4 text-center bg-[#FAF9F7] hover:bg-[#F3F0EA]/30 transition-all cursor-pointer ${
                readOnly ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-1 text-[#554756]">
                <svg className="w-7 h-7 text-[#2A1F2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <span className="text-[13px] font-bold text-[#352637]">Tải tệp ghi âm cho Section này</span>
                <span className="text-[11px] text-[#706473]">MP3, WAV, M4A tối đa 50 MB</span>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/x-m4a"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
