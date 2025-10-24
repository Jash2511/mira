import React from 'react';

export default function TabNav({ tabs = [], current, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button
          key={t}
          className={"tab" + (current === t ? " active" : "")}
          onClick={() => onChange && onChange(t)}
          type="button"
        >
          {t}
        </button>
      ))}
    </div>
  );
}
