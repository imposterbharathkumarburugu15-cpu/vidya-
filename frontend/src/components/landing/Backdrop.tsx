/** Public-site backdrop: a soft charcoal gradient (graphite on the left, warming toward the map on the right) with two
 *  broad low-contrast lights, a gentle vignette and fine grain. Static; no blobs, beams, stars or horizon arcs. */
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[linear-gradient(155deg,#1A1C21_0%,#15161A_32%,#131211_62%,#18140E_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_80%_28%,rgba(212,175,55,0.085),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_100%,rgba(140,155,180,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.32)_100%)]" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
