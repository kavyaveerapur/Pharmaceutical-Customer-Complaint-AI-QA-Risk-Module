import React, { useEffect, useRef, useState } from 'react';
import './ScrollExpand.css';

export default function ScrollExpand({
  children,
  title = 'Pharmaceutical Customer Complaint & AI QA Risk Module',
}) {
  const containerRef = useRef(null);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let ticking = false;

    const updateProgress = () => {
      const rect =
        container.getBoundingClientRect();

      const viewportHeight =
        window.innerHeight;

      /*
       * This component ONLY reads the current
       * browser scroll position.
       *
       * It NEVER calls scrollTo(),
       * scrollIntoView(), or any navigation method.
       */
      const scrollDistance =
        Math.max(
          container.offsetHeight - viewportHeight,
          1
        );

      const distanceFromStart =
        Math.min(
          Math.max(-rect.top, 0),
          scrollDistance
        );

      const nextProgress =
        distanceFromStart / scrollDistance;

      setProgress(nextProgress);

      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(
        updateProgress
      );
    };

    const handleResize = () => {
      updateProgress();
    };

    updateProgress();

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );

      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, []);

  /*
   * Expand the frame as the user manually scrolls.
   */
  const frameProgress =
    Math.min(
      Math.max(progress * 1.4, 0),
      1
    );

  /*
   * Reveal Page 2 after the transition has started.
   */
  const contentProgress =
    Math.min(
      Math.max(
        (progress - 0.38) / 0.62,
        0
      ),
      1
    );

  const frameWidth =
    42 +
    (100 - 42) *
      frameProgress;

  const frameHeight =
    58 +
    (100 - 58) *
      frameProgress;

  const frameRadius =
    24 -
    24 *
      frameProgress;

  const titleOpacity =
    Math.max(
      1 -
        progress * 2.5,
      0
    );

  const titleScale =
    1 +
    progress * 0.14;

  const contentTranslateY =
    35 -
    contentProgress * 35;

  return (
    <section
      ref={containerRef}
      className="scroll-expand"
    >

      <div className="scroll-expand-sticky">

        <div
          className="scroll-expand-frame"
          style={{
            width: `${frameWidth}%`,
            height: `${frameHeight}%`,
            borderRadius: `${frameRadius}px`,
          }}
        >

          <div className="scroll-expand-frame-glow" />

          <div className="scroll-expand-frame-grid" />


          {/* =================================
              TRANSITION TITLE
              ================================= */}
          <div
            className="scroll-expand-title"
            style={{
              opacity: titleOpacity,
              transform:
                `scale(${titleScale})`,
            }}
          >
            <span>
              {title}
            </span>
          </div>


          {/* =================================
              PAGE 2 CONTENT
              ================================= */}
          <div
            className="scroll-expand-content"
            style={{
              opacity: contentProgress,
              transform:
                `translateY(${contentTranslateY}px)`,
              pointerEvents:
                contentProgress > 0.8
                  ? 'auto'
                  : 'none',
            }}
          >
            {children}
          </div>

        </div>


        {/* =================================
            SCROLL HINT
            ================================= */}
        <div
          className="scroll-expand-scroll-hint"
          style={{
            opacity:
              Math.max(
                1 -
                  progress * 4,
                0
              ),
          }}
        >

          <span>
            Scroll to enter the QMS workspace
          </span>

          <span className="scroll-expand-arrow">
            ↓
          </span>

        </div>

      </div>

    </section>
  );
}
