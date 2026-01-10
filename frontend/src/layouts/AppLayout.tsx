export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">What Name</h1>
      </header>
      <main className="grow p-3">{children}</main>
    </div>
  );
}
