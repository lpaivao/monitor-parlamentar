import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { cn } from "../../lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-slot="avatar"
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "flex h-full w-full items-center justify-center bg-(--bg-raised) font-sans font-bold text-(--text-strong)",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

interface AvatarProps {
  nome: string;
  foto: string | null;
  size?: "sm" | "lg" | "xl";
  shape?: "circle" | "square";
  bordered?: boolean;
}

export function ParlamentarAvatar({
  nome,
  foto,
  size = "sm",
  shape = "circle",
  bordered = true,
}: AvatarProps) {
  const initial = nome?.[0]?.toUpperCase() ?? "?";
  const sizeClass = size === "xl" ? "h-24 w-24" : size === "lg" ? "h-18 w-18" : "h-8 w-8";
  const shapeClass =
    shape === "square"
      ? size === "xl"
        ? "rounded-lg"
        : size === "lg"
          ? "rounded-xl"
          : "rounded-md"
      : "rounded-full";

  return (
    <Avatar
      className={cn(
        bordered && "border border-(--border) transition-colors hover:border-(--accent-border)",
        sizeClass,
        shapeClass,
      )}
    >
      <AvatarImage
        src={foto ?? undefined}
        alt={nome}
        className="rounded-[inherit]"
      />
      <AvatarFallback
        className={cn(
          "rounded-[inherit]",
          size === "xl" ? "text-3xl" : size === "lg" ? "text-2xl" : "text-[13px]",
        )}
        delayMs={250}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarFallback, AvatarImage };

