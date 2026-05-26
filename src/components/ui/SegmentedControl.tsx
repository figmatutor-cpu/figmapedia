"use client";

interface SegmentedControlTab {
  key: string;
  label: string;
  count?: number;
}

interface SegmentedControlProps {
  tabs: SegmentedControlTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function SegmentedControl({
  tabs,
  activeTab,
  onTabChange,
}: SegmentedControlProps) {
  return (
    <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`h-11 inline-flex items-center px-4 rounded-full text-body whitespace-nowrap transition-all border ${
              activeTab === tab.key
                ? "bg-brand-blue-accent border-brand-blue-accent text-fg-1 font-medium"
                : "bg-glass-1 border-border-1 text-fg-3 hover:text-fg-2 hover:border-border-2"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-meta opacity-75">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
