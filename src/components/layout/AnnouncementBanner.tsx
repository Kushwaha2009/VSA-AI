import React, { useState, useEffect } from 'react';
import { Megaphone, X, AlertCircle } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<{
    active: boolean;
    message: string;
    type: 'info' | 'warning' | 'alert';
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.announcement?.active) {
          setAnnouncement(data.settings.announcement);
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement || !announcement.active || dismissed) return null;

  const bgStyles = {
    info: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white',
    warning: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white',
    alert: 'bg-gradient-to-r from-rose-600 to-red-600 text-white',
  };

  return (
    <div
      id="system-announcement-banner"
      className={`px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm relative z-40 ${bgStyles[announcement.type] || bgStyles.info}`}
    >
      <div className="flex items-center gap-2 max-w-6xl mx-auto w-full justify-center text-center">
        <Megaphone className="w-3.5 h-3.5 shrink-0 animate-bounce" />
        <span className="leading-snug">{announcement.message}</span>
      </div>
      <button
        id="btn-dismiss-announcement"
        onClick={() => setDismissed(true)}
        className="p-1 rounded-md hover:bg-white/20 text-white/90 hover:text-white transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
