export function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-2 border-gray-200 rounded-md p-2">
      <legend className="ml-1 px-2">{legend}</legend>
      {children}
    </fieldset>
  );
}
