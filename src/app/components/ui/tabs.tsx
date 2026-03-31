import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  style?: React.CSSProperties;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActive,
  onChange,
  style: customStyle,
}) => {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id || '');
  const active = controlledActive || internalActive;

  const handleChange = (id: string) => {
    setInternalActive(id);
    onChange?.(id);
  };

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      background: 'var(--color-surface-raised)',
      borderRadius: 12,
      padding: 4,
      ...customStyle,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'capitalize',
            background: active === tab.id ? 'var(--color-surface)' : 'transparent',
            color: active === tab.id ? 'var(--color-text)' : 'var(--color-text-tertiary)',
            boxShadow: active === tab.id ? 'var(--shadow-sm)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-display)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
