import { Title } from "@/svg/Title";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="bg-yellow-100 text-white p-4">
        <h1 className="text-2xl font-bold">
          <Title />
        </h1>
      </header>
      <main className="p-3 max-w-xl m-auto">{children}</main>
    </div>
  );
}
