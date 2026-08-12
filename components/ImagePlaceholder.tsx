import { ImageIcon } from "lucide-react";

type ImagePlaceholderProps = {
  label?: string;
  className?: string;
};

export function ImagePlaceholder({
  label = "image",
  className = ""
}: ImagePlaceholderProps) {
  return (
    <div className={`image-placeholder ${className}`}>
      <ImageIcon aria-hidden="true" size={54} strokeWidth={2.2} />
      <span>{label}</span>
    </div>
  );
}
