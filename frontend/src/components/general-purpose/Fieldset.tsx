export function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border border-gray-300 rounded-md p-2">
      <legend className="">{legend}</legend>
      {children}
    </fieldset>
  );
}
