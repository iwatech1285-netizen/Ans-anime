import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const POPUP_LAST_SHOWN_KEY = 'ans_popup_last_shown';

export const AdPopup: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    const adConfig = settings?.ads;
    if (!adConfig || !adConfig.popup_enabled || !adConfig.popup_code) return;

    // Check interval
    const intervalMinutes = adConfig.popup_interval_minutes || 30;
    const intervalMs = intervalMinutes * 60 * 1000;
    const lastShown = parseInt(localStorage.getItem(POPUP_LAST_SHOWN_KEY) || '0', 10);
    const now = Date.now();

    if (now - lastShown < intervalMs) {
      return;
    }

    // Set last shown
    localStorage.setItem(POPUP_LAST_SHOWN_KEY, now.toString());

    // Inject safely into a sandboxed frame
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';

      // Sandbox restrictions for safe ad network script running
      iframe.sandbox.add('allow-scripts');
      iframe.sandbox.add('allow-popups');
      iframe.sandbox.add('allow-popups-to-escape-sandbox');

      iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body>
            ${adConfig.popup_code}
          </body>
        </html>
      `;

      document.body.appendChild(iframe);

      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 15000);
    } catch (err) {
      console.warn('Ad popup execution error:', err);
    }
  }, [settings?.ads]);

  return null;
};
