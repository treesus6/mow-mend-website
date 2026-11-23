interface BrandLogoProps {
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

export function BrandLogo({ variant = 'dark', showTagline = false }: BrandLogoProps) {
  const textColor = variant === 'light' ? 'text-[#F5F2EA]' : 'text-[#141715]';
  const ampersandColor = variant === 'light' ? 'text-[#F59E0B]' : 'text-[#E86F14]';
  const subColor = variant === 'light' ? 'text-[#C8C3B4]' : 'text-[#525753]';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <span className="inline-flex items-center justify-center w-11 h-9 rounded-md bg-[#F5F2EA] border border-[#D6D1C4] p-0.5 shrink-0 overflow-hidden">
        <img
          src="/images/smokiey-mascot.png"
          alt="Smokiey the Mower mascot for MOW & MEND LLC"
          className="w-full h-full object-contain"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold uppercase tracking-[0.03em] text-2xl ${textColor}`}
        >
          MOW <span className={ampersandColor}>&amp;</span> MEND
        </span>
        {showTagline && (
          <span className={`text-[11px] font-medium mt-0.5 ${subColor}`}>
            Mow money, mow problems.
          </span>
        )}
      </span>
    </span>
  );
}
