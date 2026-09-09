export default function Home() {
  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-14">
      <header className="mx-auto flex max-w-[1500px] items-center justify-between border-b border-[#dfe4e1] pb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl border border-[#cfd7d2] bg-white font-mono text-xs font-semibold">OE</div>
          <div>
            <div className="text-sm font-semibold tracking-tight">OECL</div>
            <div className="text-xs text-[#68706c]">Open ERC Composition Laboratory</div>
          </div>
        </div>
        <nav className="flex gap-6 text-sm text-[#68706c]">
          <span>Explorer</span><span>Methodology</span><span>Evidence</span>
        </nav>
      </header>

      <section className="mx-auto max-w-[1500px] pt-16">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-[#1e5d46]">Scientific composition intelligence</p>
        <h1 className="max-w-5xl text-5xl font-medium leading-[1.02] tracking-[-0.045em] md:text-7xl">
          Discover how Ethereum standards can compose.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#68706c]">
          Explore candidates, protocol boundaries, runtime evidence, and the scientific reasoning behind each composition state.
        </p>
      </section>
    </main>
  );
}
