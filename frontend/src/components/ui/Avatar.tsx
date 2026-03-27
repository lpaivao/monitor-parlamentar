import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

function Avatar({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border-2 border-[var(--border)] transition-colors hover:border-[var(--accent-border)]",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center bg-[var(--bg-raised)] font-sans font-bold text-[var(--text-strong)]",
        className,
      )}
      {...props}
    />
  );
}

interface AvatarProps {
  nome: string;
  foto: string | null;
  size?: "sm" | "lg";
}

export function ParlamentarAvatar({ nome, foto, size = "sm" }: AvatarProps) {
  const initial = nome?.[0]?.toUpperCase() ?? "?";

  return (
    <Avatar className={size === "lg" ? "h-[72px] w-[72px]" : "h-8 w-8"}>
      <AvatarImage
        src={foto ?? undefined}
        alt={nome}
      />
      <AvatarFallback className={size === "lg" ? "text-2xl" : "text-[13px]"} delayMs={250}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarFallback, AvatarImage };
