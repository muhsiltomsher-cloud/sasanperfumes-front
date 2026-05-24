"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQGroup {
  title: string;
  items: FAQItem[];
}

interface GroupedFAQAccordionProps {
  groups: FAQGroup[];
}

export function GroupedFAQAccordion({ groups }: GroupedFAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      {groups.map((group, groupIdx) => (
        <div key={groupIdx}>
          {group.title && (
            <h2 className="mb-6 text-2xl font-light text-brand-primary">{group.title}</h2>
          )}
          <div className="space-y-2">
            {group.items.map((item, itemIdx) => {
              const itemId = `${groupIdx}-${itemIdx}`;
              const isOpen = openIndex === itemId;

              return (
                <div key={itemId} className="border border-[#e7ded7] rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : itemId)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-[#faf8f6] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-normal text-brand-primary">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 flex-shrink-0 text-brand-primary transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isOpen ? "max-h-96" : "max-h-0"
                    )}
                  >
                    <div className="px-6 pb-4 pt-2 border-t border-[#e7ded7]">
                      <p className="text-sm text-brand-primary/60 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
