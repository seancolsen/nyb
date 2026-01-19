import { cn } from "@/utils";

interface Props {
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  className,
  children,
  type = "button",
  disabled = false,
  onClick,
}: Props) {
  return (
    <button
      className={cn(
        "px-2 py-1 rounded-md bg-gray-200 cursor-pointer hover:bg-gray-300",
        className,
      )}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
