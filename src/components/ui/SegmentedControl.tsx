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
    <div className="overflow-x-auto pb-5 -mb-5">
      <div className="flex gap-2 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border ${
              activeTab === tab.key
                ? "bg-brand-blue-accent border-brand-blue-accent text-white"
                : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/15"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xxs opacity-50">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
