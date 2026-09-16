import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './MaskedHeading.css';

export default function MaskedHeading({
  children = 'Pharmaceutical Customer Complaint & AI QA Risk Module',
}) {
  const headingRef = useRef(null);
  const maskRef = useRef(null);

  useEffect(() => {
    const heading = headingRef.current;
    const mask = maskRef.current;

    if (!heading || !mask) return;

    const ctx = gsap.context(() => {
      gsap.set(mask, {
        clipPath: 'inset(0 100% 0 0)',
      });

      gsap.to(mask, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.8,
        ease: 'power3.out',
        delay: 0.25,
      });

      gsap.fromTo(
        heading,
        {
          y: 22,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.15,
        }
      );
    }, heading);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={headingRef}
      className="masked-heading"
    >
      <span className="masked-heading-base">
        {children}
      </span>

      <span
        ref={maskRef}
        className="masked-heading-fill"
        aria-hidden="true"
      >
        {children}
      </span>
    </div>
  );
}
