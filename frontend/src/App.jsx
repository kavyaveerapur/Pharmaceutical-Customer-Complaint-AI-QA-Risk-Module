import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Navbar from './components/Navbar';
import ComplaintForm from './components/ComplaintForm';
import AIVOACopilot from './components/AIVOACopilot';
import QMSLedger from './components/QMSLedger';
import AIInsights from './components/AIInsights';
import NotificationBanner from './components/NotificationBanner';

import LandingPage from './components/landing/LandingPage';
import GradientWaves from './components/landing/GradientWaves';
import HomeButton from './components/HomeButton';

export default function App() {
  const activeTab = useSelector(
    (state) => state.complaints.activeTab
  );

  /*
   * =====================================================
   * APPLICATION VISIBILITY
   * =====================================================
   *
   * false = Landing/Home experience
   * true  = QMS application
   *
   * The QMS application does NOT exist on the home page
   * until a workspace is selected.
   */
  const [showApplication, setShowApplication] = useState(false);


  /*
   * =====================================================
   * INITIAL HOME POSITION
   * =====================================================
   *
   * Keeps the landing page at the top.
   *
   * This does not interfere with QMS navigation.
   */
  useLayoutEffect(() => {
    if (!showApplication) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
  }, [showApplication]);


  /*
   * =====================================================
   * OPEN QMS APPLICATION
   * =====================================================
   *
   * This is triggered only after selecting one of the
   * three workspace options.
   */
  useEffect(() => {
    if (!showApplication) return;

    const qmsApplication =
      document.getElementById('qms-application');

    if (!qmsApplication) return;

    requestAnimationFrame(() => {
      qmsApplication.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [showApplication]);


  /*
   * =====================================================
   * HOME -> QMS
   * =====================================================
   */
  const handleOpenWorkspace = () => {
    setShowApplication(true);
  };


  /*
   * =====================================================
   * QMS -> HOME
   * =====================================================
   *
   * Removes the QMS application from the DOM and returns
   * the user to Page 1 of the landing experience.
   */
  const handleBackToHome = () => {
    setShowApplication(false);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  };


  return (
    <div className="app-shell">


      {/* =================================================
          HOME / LANDING EXPERIENCE
          ================================================= */}

      {!showApplication && (
        <LandingPage
          onOpenWorkspace={handleOpenWorkspace}
        />
      )}


      {/* =================================================
          EXISTING QMS APPLICATION
          ================================================= */}

      {showApplication && (
        <section
          id="qms-application"
          className="qms-application"
        >

          {/* ---------------------------------------------
              SAME ANIMATED VISUAL LANGUAGE AS HOMEPAGE
              --------------------------------------------- */}

          <div
            className="qms-background"
            aria-hidden="true"
          >
            <GradientWaves
              horizonColor="#120A2A"
              waveColor="#5227FF"
              crestColor="#FF9FFC"
              speed={0.22}
              amplitude={1.8}
              waveScale={0.55}
              waveRatio={0.9}
              swell={25}
              turbulence={14}
              tilt={1.11}
              zoom={1}
              height={5.2}
              fogDepth={18}
              detail="medium"
              brightness={0.72}
              opacity={0.58}
              mouseInteraction={true}
              parallaxStrength={0.32}
              grain={true}
              grainIntensity={0.025}
            />
          </div>


          {/* ---------------------------------------------
              QMS CONTENT
              --------------------------------------------- */}

          <div className="qms-application-content">

            {/* ==========================================
                BACK TO HOME
                ========================================== */}

            <div className="qms-home-row">
              <HomeButton
                onClick={handleBackToHome}
              />
            </div>


            {/* ==========================================
                EXISTING NAVBAR
                ========================================== */}

            <Navbar />


            {/* ==========================================
                EXISTING QMS CONTENT
                ========================================== */}

            <main className="qms-main">


              {/* ========================================
                  COMPLAINT INTAKE + AI COPILOT
                  ======================================== */}

              {activeTab === 'intake' && (
                <div
                  className="
                    qms-intake-grid
                    grid
                    grid-cols-1
                    lg:grid-cols-12
                    flex-1
                    items-stretch
                  "
                >

                  {/* Complaint Intake */}
                  <div className="qms-intake-form-panel lg:col-span-7 h-full">
                    <ComplaintForm />
                  </div>


                  {/* AI Copilot */}
                  <div className="qms-copilot-panel lg:col-span-5 h-full">
                    <AIVOACopilot />
                  </div>

                </div>
              )}


              {/* ========================================
                  QMS LEDGER
                  ======================================== */}

              {activeTab === 'ledger' && (
                <div className="qms-dashboard-page flex-1">
                  <QMSLedger />
                </div>
              )}


              {/* ========================================
                  AI RISK + CAPA INSIGHTS
                  ======================================== */}

              {activeTab === 'insights' && (
                <div className="qms-dashboard-page flex-1">
                  <AIInsights />
                </div>
              )}

            </main>

          </div>


          {/* Existing notification system */}
          <NotificationBanner />

        </section>
      )}

    </div>
  );
}
