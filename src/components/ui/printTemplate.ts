export interface PrintableResult {
  label: string;
  value: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildPrintDocument(
  title: string,
  results: PrintableResult[],
  date: Date = new Date()
): string {
  const safeTitle = escapeHtml(title);
  const safeResults = results.map((result) => ({
    label: escapeHtml(result.label),
    value: escapeHtml(result.value),
  }));

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeTitle} - Boring Math</title>
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
            <h1 class="title">${safeTitle}</h1>
            <div class="date">${date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</div>
          </div>

          <div class="results">
            ${safeResults
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
        </body>
      </html>
    `;
}
