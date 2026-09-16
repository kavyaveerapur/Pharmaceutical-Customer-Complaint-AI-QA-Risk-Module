import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/complaintsSlice';

import GradientWaves from './GradientWaves';
import MaskedHeading from './MaskedHeading';
import ScrollExpand from './ScrollExpand';
import GooeyNav from './GooeyNav';

import './LandingPage.css';

import {
  ClipboardPlus,
  BookOpenCheck,
  BrainCircuit,
} from 'lucide-react';

const workspaceItems = [
  {
    id: 'intake',
    label: 'Complaint Intake & Copilot',
    icon: <ClipboardPlus size={18} />,
  },
  {
    id: 'ledger',
    label: 'QMS Ledger',
    icon: <BookOpenCheck size={18} />,
  },
  {
    id: 'insights',
    label: 'AI Risk & CAPA Insights',
    icon: <BrainCircuit size={18} />,
  },
];

export default function LandingPage({
  onOpenWorkspace,
}) {
  const dispatch = useDispatch();

  /*
   * This is the ONLY place where a landing-page
   * workspace selection happens.
   *
   * 1. Set the existing Redux tab.
   * 2. Tell App.jsx to mount the QMS application.
   *
   * App.jsx then intentionally scrolls to the newly
   * mounted QMS application.
   */
  const handleWorkspaceSelect = (item) => {
    dispatch(setActiveTab(item.id));

    if (onOpenWorkspace) {
      onOpenWorkspace();
    }
  };

  return (
    <section className="landing-page">

      {/* =================================
          ANIMATED BACKGROUND
          ================================= */}
      <div className="landing-background">
        <GradientWaves />
      </div>


      {/* =================================
          PAGE 1
          ================================= */}
      <section className="landing-hero">

        <div className="landing-hero-content">

          <MaskedHeading>
            Pharmaceutical Customer Complaint & AI QA Risk Module
          </MaskedHeading>

          <div className="landing-scroll-hint">
            <span>
              Scroll to explore
            </span>

            <span className="landing-scroll-arrow">
              ↓
            </span>
          </div>

        </div>

      </section>


      {/* =================================
          PAGE 2 / SCROLL EXPANSION
          ================================= */}
      <ScrollExpand>

        <div className="landing-workspace-page">

          <div className="landing-workspace-content">

            {/* =================================
                BRAND
                ================================= */}
            <div className="landing-brand">

              <div className="landing-logo">
                <span>AI</span>
              </div>

              <div className="landing-brand-text">

                <span className="landing-brand-name">
                  AIVOA.AI
                </span>

                <span className="landing-brand-subtitle">
                  Quality Management System
                </span>

              </div>

            </div>


            {/* =================================
                HEADING
                ================================= */}
            <div className="landing-workspace-heading">

              <span className="landing-eyebrow">
                AI-POWERED QUALITY OPERATIONS
              </span>

              <h2>
                Select a workspace
              </h2>

              <p>
                Choose the QMS module you want to work with.
              </p>

            </div>


            {/* =================================
                THREE WORKSPACE OPTIONS
                ================================= */}
            <GooeyNav
              items={workspaceItems}
              activeIndex={0}
              onSelect={handleWorkspaceSelect}
            />

          </div>

        </div>

      </ScrollExpand>

    </section>
  );
}
