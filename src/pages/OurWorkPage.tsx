import { useState } from 'react';
import { Camera, ArrowRight } from 'lucide-react';
import { BeforeAfterCompare } from '../components/BeforeAfterCompare.tsx';
import { COMPLETED_JOB_PHOTOS, PROJECT_SHOWCASE } from '../data/projects.ts';

interface OurWorkPageProps {
  onNavigate: (path: string) => void;
}

const CATEGORIES = ['All Projects', 'Yard & Cleanups', 'Pressure Washing', 'Fence & Carpentry'] as const;

export function OurWorkPage({ onNavigate }: OurWorkPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('All Projects');

  const filtered = PROJECT_SHOWCASE.filter((item) =>
    selectedCategory === 'All Projects' ? true : item.category === selectedCategory
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#D6D1C4]">
        <div className="max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
            Our Work · Clark County, WA
          </p>
          <h1
            className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Real Clark County Project Photos
          </h1>
          <p className="mt-3 text-base text-[#3D423E] leading-relaxed">
            Genuine completed lawn maintenance, cleanups, and property work across Vancouver and
            Clark County. Customer names and street addresses are never published.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/estimate')}
          className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm rounded-lg hover:bg-[#F37F24] transition-colors shrink-0 cursor-pointer"
        >
          <span>Request a Free Estimate</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Real Completed Job Photos (After-Shots) */}
      <section className="space-y-5">
        <div className="max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-1">
            Completed Job Gallery
          </p>
          <h2 className="font-display font-extrabold uppercase text-2xl sm:text-3xl text-[#141715]">
            Finished residential work (no stock photography)
          </h2>
          <p className="mt-1.5 text-sm text-[#3D423E]">
            Recent finished-work photographs from a residential Vancouver, WA mow, trim, and
            yard cleanup job (November 2026).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMPLETED_JOB_PHOTOS.map((photo) => (
            <figure
              key={photo.id}
              className="min-w-0 bg-white border border-[#D6D1C4] rounded-xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] bg-[#EAE5D8] overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-4 space-y-1.5">
                <p className="text-xs font-mono text-[#525753]">
                  {photo.category} · {photo.area} · {photo.completedMonth}
                </p>
                <h3 className="font-display font-bold text-lg text-[#141715] leading-snug">
                  {photo.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#3D423E] leading-relaxed">{photo.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Honest Before & After Section (kept honest until paired before+after shots exist) */}
      <section className="space-y-6 pt-6 border-t border-[#D6D1C4]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-1">
              Side-by-Side Comparisons
            </p>
            <h2 className="font-display font-extrabold uppercase text-2xl sm:text-3xl text-[#141715]">
              Before &amp; After Project Sliders
            </h2>
          </div>

          <div className="flex flex-wrap gap-1 p-1 bg-[#EAE5D8] border border-[#D6D1C4] rounded-lg self-start">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 min-h-[38px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#141715] text-[#F5F2EA]'
                    : 'text-[#3D423E] hover:text-[#141715]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#D6D1C4] rounded-xl p-5 flex items-start gap-3.5">
          <Camera className="w-5 h-5 text-[#E86F14] shrink-0 mt-0.5" />
          <div className="text-sm text-[#3D423E] leading-relaxed">
            <p className="font-semibold text-[#141715]">
              Before/After Pairs Added Only When Matched Photos Exist
            </p>
            <p className="mt-1">
              The completed photos above are finished after-shots. To keep every comparison honest,
              the before/after frames below remain in their empty state until matching pre-work and
              post-work pairs are captured on future jobs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((project) => (
            <BeforeAfterCompare key={project.id} project={project} />
          ))}
        </div>
      </section>

      <div className="bg-[#141715] bg-workwear-grid text-[#F5F2EA] border border-[#2C322E] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold uppercase text-2xl">
            Have a project that needs a cleanup or fix?
          </h2>
          <p className="text-sm text-[#C8C3B4] mt-1">
            Upload up to 5 photos of your yard, fence, or driveway for a custom estimate.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/estimate')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm rounded-lg hover:bg-[#F37F24] transition-colors shrink-0 cursor-pointer"
        >
          <span>Request a Free Estimate</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
