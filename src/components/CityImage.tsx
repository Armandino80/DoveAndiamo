import { useEffect, useState } from "react";

interface CityImageProps {
  src: string;
  alt: string;
  name: string;
  className?: string;
  loading?: "eager" | "lazy";
  width?: number;
  height?: number;
}

export function CityImage({
  src,
  alt,
  name,
  className = "",
  loading = "eager",
  width = 1280,
  height = 960,
}: CityImageProps) {
  const [imageOk, setImageOk] = useState(true);

  useEffect(() => {
    setImageOk(true);
  }, [src]);

  if (!imageOk) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} flex items-center justify-center bg-secondary text-center font-display text-2xl italic text-muted-foreground`}
      >
        <span className="px-4">{name}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={className}
      onError={() => setImageOk(false)}
    />
  );
}
