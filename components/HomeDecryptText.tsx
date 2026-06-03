"use client";

interface HomeDecryptTextProps {
  text: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
}

export default function HomeDecryptText({
  text,
  className = "text-current",
  parentClassName = "",
}: HomeDecryptTextProps) {
  return (
    <span className={parentClassName}>
      <span className={className}>{text}</span>
    </span>
  );
}
