import { useState } from 'react';
import { Camera, MoveHorizontal } from 'lucide-react';
import type { ProjectShowcaseItem } from '../data/projects.ts';

interface BeforeAfterCompareProps {
  project: ProjectShowcaseItem;
}

export function BeforeAfterCompare({ project }: BeforeAfterCompareProps) {
  const [splitPercent, setSplitPercent] = useState(50);

  const hasPhotos =
    project.hasApprovedPhotos && Boolean(project.beforeImageUrl) && Boolean(project.afterImageUrl);

  return (
    <article className="min-w-0 bg-white border border-[#E2E0D8] rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] w-full bg-[#EFECE3] overflow-hidden select-none">
        {hasPhotos ? (
          <>
            <img
              src={project.afterImageUrl}
              alt={project.afterAlt}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
            >
              <img
                src={project.beforeImageUrl}
                alt={project.beforeAlt}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className="absolute inset-y-0 w-0.5 bg-[#F8F7F3] shadow-sm pointer-events-none"
              style={{ left: `${splitPercent}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#143326] text-[#F8F7F3] border-2 border-[#F8F7F3] flex items-center justify-center shadow">
                <MoveHorizontal className="w-4 h-4" />
              </div>
            </div>

            <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-mono font-semibold bg-[#161917]/85 text-[#F8F7F3] rounded">
              Before
            </span>
            <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-mono font-semibold bg-[#143326]/90 text-[#F8F7F3] rounded">
              After
            </span>

            <input
              type="range"
              min={5}
              max={95}
              value={splitPercent}
              onChange={(e) => setSplitPercent(Number(e.target.value))}
              aria-label={`Compare before and after photos for ${project.title}`}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
            />
          </>
        ) : (
          <div className="absolute inset-0 grid grid-cols-2 divide-x divide-[#D7D3C7]">
            <div className="p-4 sm:p-5 flex flex-col justify-between bg-[#ECE9DF]">
              <span className="text-[11px] font-mono font-semibold text-[#535B55]">
                BEFORE SLOT
              </span>
              <div className="my-auto py-3 text-center">
                <Camera className="w-6 h-6 text-[#6D756E] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#3E453F] leading-snug">
                  {project.beforeAlt}
                </p>
              </div>
              <span className="text-[11px] text-[#6D756E]">Awaiting owner photo</span>
            </div>

            <div className="p-4 sm:p-5 flex flex-col justify-between bg-[#143326] text-[#F8F7F3]">
              <span className="text-[11px] font-mono font-semibold text-[#F59E0B]">
                AFTER SLOT
              </span>
              <div className="my-auto py-3 text-center">
                <Camera className="w-6 h-6 text-[#A3B8AC] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#E3EAE5] leading-snug">
                  {project.afterAlt}
                </p>
              </div>
              <span className="text-[11px] text-[#A3B8AC]">Verified asset ready</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#535B55] mb-2">
            <span className="font-semibold text-[#143326]">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.city}</span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#161917] leading-snug mb-2">
            {project.title}
          </h3>
          <p className="text-sm text-[#434A45] leading-relaxed">{project.description}</p>
        </div>

        <p className="pt-3 border-t border-[#ECE9DF] text-xs font-mono text-[#535B55]">
          {project.scopeSummary}
        </p>
      </div>
    </article>
  );
}
