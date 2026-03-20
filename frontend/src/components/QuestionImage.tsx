interface QuestionImageProps {
  imageUrl: string;
  imagePlacement: "centered" | "background";
  variant?: "game" | "preview";
}

export function QuestionImage({
  imageUrl,
  imagePlacement,
  variant = "game",
}: QuestionImageProps) {
  if (!imageUrl) return null;

  if (imagePlacement === "background") {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    );
  }

  return (
    <div className="w-full flex justify-center px-4 pb-4">
      <img
        src={imageUrl}
        alt="Question"
        className={
          variant === "game"
            ? "max-h-48 sm:max-h-64 object-contain rounded-lg"
            : "max-h-32 object-contain rounded-lg"
        }
      />
    </div>
  );
}
