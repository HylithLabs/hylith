"use client";

import DecryptedText from "@/components/DecryptedText";

interface HomeDecryptTextProps {
  text: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
}

export default function HomeDecryptText({
  text,
  className = "text-current",
  encryptedClassName = "text-current opacity-35",
  parentClassName = "",
}: HomeDecryptTextProps) {
  return (
    <DecryptedText
      text={text}
      animateOn="hover"
      clickMode="once"
      sequential
      revealDirection="start"
      speed={20}
      maxIterations={1}
      useOriginalCharsOnly
      className={className}
      encryptedClassName={encryptedClassName}
      parentClassName={parentClassName}
    />
  );
}
