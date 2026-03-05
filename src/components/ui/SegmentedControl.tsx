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
            className={`h-11 inline-flex items-center px-4 rounded-full text-sm whitespace-nowrap transition-all border ${
              activeTab === tab.key
                ? "bg-brand-blue-accent border-brand-blue-accent text-white font-medium"
                : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/15"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
