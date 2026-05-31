import { useState, useEffect } from 'react';

interface ScanProgressProps {
  isScanning: boolean;
}

const STEPS = [
  "Preparing scan",
  "Scanning for social media profiles",
  "Checking development platforms",
  "Checking gaming platforms",
  "Verifying profile existence",
  "Compiling results",
];

export function ScanProgress({ isScanning }: ScanProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isScanning) {
      setCurrentStep(0);
      setDots('');
      return;
    }

    // Cycle through steps to show activity
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev; // Stay on last step
      });
    }, 2500);

    // Animate dots
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
    };
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div style={{
      background: '#141414',
      border: '1px solid #00ff6630',
      padding: '1.5rem',
      marginTop: '2rem',
    }}>
      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '3px',
        background: '#222',
        marginBottom: '1.25rem',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div
          style={{
            height: '100%',
            background: '#00ff66',
            width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.8s ease',
          }}
        />
      </div>

      {/* Step list */}
      <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
        {STEPS.map((step, idx) => {
          let color = '#333';    // future step
          let prefix = '○';

          if (idx < currentStep) {
            color = '#00ff66';   // completed
            prefix = '●';
          } else if (idx === currentStep) {
            color = '#fff';      // active
            prefix = '▸';
          }

          return (
            <div
              key={idx}
              style={{
                color,
                padding: '0.3rem 0',
                transition: 'color 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ width: '14px', display: 'inline-block' }}>{prefix}</span>
              <span>
                {step}
                {idx === currentStep ? dots : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
