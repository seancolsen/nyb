interface Props {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  type = "button",
  disabled = false,
  onClick,
}: Props) {
  return (
    <button onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}
