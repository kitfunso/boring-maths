/**
 * PrintResults Component
 *
 * Allows users to print or save their calculator results as PDF.
 * Opens a print-friendly window with formatted results.
 */

import { buildPrintDocument } from './printTemplate';

interface PrintResultsProps {
  title: string;
  results: { label: string; value: string }[];
  className?: string;
}

export default function PrintResults({ title, results, className = '' }: PrintResultsProps) {
  const handlePrint = () => {
    const printFrame = document.createElement('iframe');
    printFrame.setAttribute('sandbox', 'allow-modals allow-same-origin');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';
    printFrame.srcdoc = buildPrintDocument(title, results);

    const cleanup = () => {
      if (printFrame.parentNode) {
        printFrame.parentNode.removeChild(printFrame);
      }
    };

    printFrame.addEventListener('load', () => {
      const frameWindow = printFrame.contentWindow;
      if (!frameWindow) {
        cleanup();
        return;
      }

      frameWindow.focus();
      frameWindow.print();

      setTimeout(cleanup, 1000);
    });

    document.body.appendChild(printFrame);
  };

  return (
    <button
      onClick={handlePrint}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--color-subtle)] hover:text-[var(--color-cream)] transition-all text-sm ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      <span>Print / PDF</span>
    </button>
  );
}
