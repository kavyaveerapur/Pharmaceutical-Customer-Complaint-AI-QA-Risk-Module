import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

import './HomeButton.css';

export default function HomeButton({
  onClick,
}) {
  return (
    <button
      type="button"
      className="qms-home-button"
      onClick={onClick}
      aria-label="Back to Home"
    >
      <ArrowLeft size={17} strokeWidth={2} />

      <Home
        size={16}
        strokeWidth={2}
      />

      <span>
        Back to Home
      </span>
    </button>
  );
}
