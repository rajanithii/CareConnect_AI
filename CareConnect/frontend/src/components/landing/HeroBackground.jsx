export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft gradient field */}
      <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-red-100/50 blur-[120px]" />
      <div className="absolute top-40 right-0 h-[380px] w-[380px] rounded-full bg-cyan-200/40 blur-[100px]" />

      {/* signature vital line — draws once on load, then a scan pulse loops across it */}
      <svg
        className="absolute inset-x-0 top-[58%] w-full"
        height="140"
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          className="vital-path"
          d="M0 70 L280 70 L320 30 L360 110 L400 20 L440 70 L520 70 L560 50 L600 70 L720 70 L760 30 L800 110 L840 20 L880 70 L1000 70 L1040 50 L1080 70 L1440 70"
          stroke="#EAD9DB"
          strokeWidth="2"
        />
        <path
          className="vital-scan"
          d="M0 70 L280 70 L320 30 L360 110 L400 20 L440 70 L520 70 L560 50 L600 70 L720 70 L760 30 L800 110 L840 20 L880 70 L1000 70 L1040 50 L1080 70 L1440 70"
          stroke="#C41638"
          strokeWidth="2.5"
          opacity="0.8"
        />
      </svg>

      <div className="grain-overlay" />
    </div>
  );
}
