// The app's small line icons, drawn inline so no icon font or image is needed.
export default function Icon({ name, size = 18 }) {
  const paths = {
    play: <path d="m8 5 11 7-11 7Z" />,
    board: <><rect x="3" y="3" width="18" height="14" rx="2" /><path d="m8 21 4-4 4 4M8 8h8M8 12h5" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" /></>,
    upload: <><path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4" /></>,
    arrow: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    code: <><path d="m7 7-5 5 5 5m10-10 5 5-5 5m-3-14-4 22" /></>,
    region: <><rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="3 3" /><path d="m13 13 6 6" /></>,
    page: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
    expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
    save: <><path d="M5 4h12l2 2v14H5z" /><path d="M8 4v5h8V4M8 20v-6h8v6" /></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></>,
    zoomIn: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M11 8v6M8 11h6" /></>,
    zoomOut: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M8 11h6" /></>,
    fit: <><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    dual: <><rect x="2" y="3" width="9" height="18" rx="2" /><rect x="13" y="3" width="9" height="18" rx="2" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.code}</svg>;
}
