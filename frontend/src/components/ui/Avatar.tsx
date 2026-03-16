import * as Avatar from "@radix-ui/react-avatar";

interface AvatarProps {
  nome: string;
  foto: string | null;
  size?: "sm" | "lg";
}

export function ParlamentarAvatar({ nome, foto, size = "sm" }: AvatarProps) {
  const initial = nome?.[0]?.toUpperCase() ?? "?";

  return (
    <Avatar.Root className={`radix-avatar radix-avatar-${size}`}>
      <Avatar.Image
        src={foto ?? undefined}
        alt={nome}
        className="radix-avatar-image"
      />
      <Avatar.Fallback className="radix-avatar-fallback" delayMs={250}>
        {initial}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
