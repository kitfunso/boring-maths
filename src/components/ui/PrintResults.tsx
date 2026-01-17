/**
 * PrintResults Component
 *
 * Allows users to print or save their calculator results as PDF.
 * Opens a print-friendly window with formatted results.
 */

interface PrintResultsProps {
  title: string;
  results: { label: string; value: string }[];
  className?: string;
}

export default function PrintResults({ title, results, className = '' }: PrintResultsProps) {
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Boring Math</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              color: #1a1a1a;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e5e5;
            }
            .logo {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1a1a1a;
            }
            .date {
              font-size: 12px;
              color: #888;
              margin-top: 8px;
            }
            .results {
              margin: 20px 0;
            }
            .result-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .result-row:last-child {
              border-bottom: none;
            }
            .result-label {
              color: #666;
              font-size: 14px;
            }
            .result-value {
              font-weight: 600;
              font-size: 14px;
              color: #1a1a1a;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e5e5e5;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
            .footer a {
              color: #666;
              text-decoration: none;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">BORING MATH CALCULATORS</div>
            <h1 class="title">${title}</h1>
            <div class="date">${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</div>
          </div>

          <div class="results">
            ${results
              .map(
                (r) => `
              <div class="result-row">
                <span class="result-label">${r.label}</span>
                <span class="result-value">${r.value}</span>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="footer">
            <p>Generated at <a href="https://boring-math.com">boring-math.com</a></p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
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
