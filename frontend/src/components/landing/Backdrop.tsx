/** Public-site backdrop: obsidian black with one broad, static, very faint warm light (no visible edge), a soft vignette
 *  and fine grain. Deliberately no drifting blobs, light beams, stars or horizon arcs. */
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05070B]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_78%_32%,rgba(212,175,55,0.07),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.55)_100%)]" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
