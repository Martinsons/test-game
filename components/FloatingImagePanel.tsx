"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  imageUrl: string; // local path, e.g. /images/places/riga.jpg
}

export default function FloatingImagePanel({ imageUrl }: Props) {
  const [minimized, setMinimized] = useState(false);
  const [enlarged, setEnlarged] = useState(false);

  // null = CSS-centred (default), set on first drag
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  // Reset panel position when a new image is shown
  useEffect(() => {
    setPosition(null);
    setMinimized(false);
    setEnlarged(false);
  }, [imageUrl]);

  const onHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!panelRef.current) return;
      e.preventDefault();
      const rect = panelRef.current.getBoundingClientRect();
      const px = position?.x ?? rect.left;
      const py = position?.y ?? rect.top;
      setPosition({ x: px, y: py });
      dragOrigin.current = { mx: e.clientX, my: e.clientY, px, py };
    },
    [position]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragOrigin.current) return;
      setPosition({
        x: dragOrigin.current.px + (e.clientX - dragOrigin.current.mx),
        y: dragOrigin.current.py + (e.clientY - dragOrigin.current.my),
      });
    };
    const onUp = () => { dragOrigin.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const panelStyle: React.CSSProperties = position
    ? { position: "absolute", left: position.x, top: position.y, transform: "none" }
    : { position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)" };

  return (
    <>
      {/* Floating panel */}
      <div
        ref={panelRef}
        style={{ ...panelStyle, zIndex: 1100, width: 300, userSelect: "none" }}
        className="bg-gray-900/95 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-between px-3 py-2 bg-gray-800 cursor-grab active:cursor-grabbing"
          onMouseDown={onHeaderMouseDown}
        >
          <span className="text-gray-400 text-xs uppercase tracking-widest select-none">
            Kur atrodas šī vieta?
          </span>
          <div className="flex gap-1" onMouseDown={(e) => e.stopPropagation()}>
            {!minimized && (
              <button
                onClick={() => setEnlarged(true)}
                className="text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700"
                title="Palielināt"
              >
                ⤢
              </button>
            )}
            <button
              onClick={() => setMinimized((m) => !m)}
              className="text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700"
              title={minimized ? "Atvērt" : "Minimizēt"}
            >
              {minimized ? "＋" : "－"}
            </button>
          </div>
        </div>

        {!minimized && (
          <img
            src={imageUrl}
            alt="Atpazīsti vietu"
            className="w-full object-cover cursor-zoom-in"
            style={{ height: 200 }}
            onClick={() => setEnlarged(true)}
          />
        )}
      </div>

      {/* Enlarged modal */}
      {enlarged && (
        <div
          className="absolute inset-0 bg-black/85 flex items-center justify-center"
          style={{ zIndex: 1500 }}
          onClick={() => setEnlarged(false)}
        >
          <img
            src={imageUrl}
            alt="Atpazīsti vietu"
            className="max-w-[90%] max-h-[90%] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white bg-gray-800/80 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-2xl leading-none"
            onClick={() => setEnlarged(false)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
