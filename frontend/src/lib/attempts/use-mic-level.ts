import { useEffect, useRef, useState } from "react";

export const LEVEL_BARS = 40;
const SILENT = new Array<number>(LEVEL_BARS).fill(0);

/**
 * Mức âm thật của micro, trả `LEVEL_BARS` giá trị 0..1 (mới nhất ở cuối) để vẽ
 * sóng. `peakRef` giữ mức lớn nhất từ lúc bật, dùng để biết micro có thu được
 * tiếng không. `measurableRef` chỉ true khi AudioContext thật sự đang chạy
 * (không có/không resume được/không nối được nguồn thì false, người gọi không
 * nên dựa vào mức âm). Giao diện vẫn chạy với mảng lặng.
 */
export function useMicLevel(stream: MediaStream | null, active: boolean) {
  const [levels, setLevels] = useState<number[]>(SILENT);
  const peakRef = useRef(0);
  const measurableRef = useRef(false);
  useEffect(() => {
    peakRef.current = 0;
    measurableRef.current = false;
    setLevels(SILENT);
    if (!stream || !active) return;
    const Ctx: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    let context: AudioContext;
    try {
      context = new Ctx();
    } catch {
      return;
    }
    let source: MediaStreamAudioSourceNode;
    try {
      source = context.createMediaStreamSource(stream);
    } catch {
      void context.close().catch(() => undefined);
      return;
    }
    let cancelled = false;
    const markRunning = () => {
      if (!cancelled) measurableRef.current = context.state === "running";
    };
    // Trình duyệt có thể tạo context ở trạng thái "suspended"; chưa chạy thì không đo được.
    context.resume().then(markRunning, markRunning);
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let history = SILENT;
    const timer = setInterval(() => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) sum += ((v - 128) / 128) ** 2;
      // Căn lại để giọng nói bình thường (RMS ~0.1) chiếm phần lớn chiều cao.
      const level = Math.min(1, Math.sqrt(sum / data.length) * 4);
      if (level > peakRef.current) peakRef.current = level;
      history = [...history.slice(1), level];
      setLevels(history);
    }, 70);
    return () => {
      cancelled = true;
      measurableRef.current = false;
      clearInterval(timer);
      source.disconnect();
      void context.close();
    };
  }, [stream, active]);
  return { levels, peakRef, measurableRef };
}
