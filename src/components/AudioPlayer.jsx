import { useEffect, useRef, useState } from "react";
import { Music4, Play, Pause, Volume2, VolumeX } from "lucide-react";
export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(() => {
    const v = Number(localStorage.getItem("ap_vol"));
    return isNaN(v) ? 0.4 : Math.max(0, Math.min(1, v));
  });

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = vol;
    localStorage.setItem("ap_vol", String(vol));
  }, [vol]);

  // attempt to start once on first user gesture anywhere
  useEffect(() => {
    const handler = () => {
      if (!playing) return;
      audioRef.current?.play().catch(() => {});
      window.removeEventListener("pointerdown", handler);
    };
    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, [playing]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setPlaying(true);
      } catch {
        // user gesture needed; flag playing and wait for pointerdown
        setPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  return (
    <>
      <audio ref={audioRef} src="/public/ambient.mp3" loop preload="auto" />
      <div className="fixed left-4 bottom-4 z-50">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-900/70 backdrop-blur px-3 py-2 shadow-lg">
          <Music4 size={16} className="text-violet-300" />
          <button
            onClick={togglePlay}
            className="rounded-lg bg-white text-zinc-900 px-2.5 py-1 text-xs font-semibold"
            title={playing ? "Pause music" : "Play music"}
          >
            <div className="flex items-center gap-1">
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? "Pause" : "Play"}
            </div>
          </button>

          <button
            onClick={toggleMute}
            className="text-zinc-300 hover:text-white"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={vol}
            onChange={(e) => setVol(Number(e.target.value))}
            className="w-20 accent-violet-400"
            title="Volume"
          />
        </div>
      </div>
    </>
  );
}
