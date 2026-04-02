"use client";

import { useEffect, useState } from "react";

interface Props {
  wikiTitle: string;
}

export default function ExpertImage({ wikiTitle }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setImageUrl(null);
    setLoading(true);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`)
      .then((r) => r.json())
      .then((data) => {
        setImageUrl(data.thumbnail?.source ?? data.originalimage?.source ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wikiTitle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height: 200 }}>
        Ielādē attēlu...
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height: 200 }}>
        Nav pieejams attēls
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Atpazīsti vietu"
      className="w-full object-cover"
      style={{ height: 200 }}
    />
  );
}
