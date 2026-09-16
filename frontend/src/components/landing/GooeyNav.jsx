import React, { useEffect, useRef, useState } from 'react';
import './GooeyNav.css';

export default function GooeyNav({
  items = [],
  activeIndex = 0,
  onSelect,
}) {
  const [active, setActive] = useState(activeIndex);
  const navRef = useRef(null);

  useEffect(() => {
    setActive(activeIndex);
  }, [activeIndex]);

  const handleSelect = (index, item) => {
    setActive(index);

    if (onSelect) {
      onSelect(item, index);
    }
  };

  return (
    <div className="gooey-nav-wrapper">
      <div
        ref={navRef}
        className="gooey-nav"
        role="navigation"
        aria-label="QMS workspace navigation"
      >
        <div className="gooey-nav-filter" />

        {items.map((item, index) => (
          <button
            key={item.id || item.label || index}
            type="button"
            className={`gooey-nav-item ${
              active === index
                ? 'gooey-nav-item-active'
                : ''
            }`}
            onClick={() =>
              handleSelect(index, item)
            }
          >
            <span className="gooey-nav-item-content">
              {item.icon && (
                <span className="gooey-nav-icon">
                  {item.icon}
                </span>
              )}

              <span className="gooey-nav-label">
                {item.label}
              </span>

              <span className="gooey-nav-arrow">
                →
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
