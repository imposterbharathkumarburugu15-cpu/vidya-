/** Public-site backdrop: matte ink navy shading into graphite blue, two broad low-contrast lights (cool from the upper
 *  left, warm dusk from the lower right), a soft vignette and fine grain. Static: no animation, no glow. */
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[linear-gradient(180deg,#0A1220_0%,#0D1626_45%,#111B2C_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_12%_0%,rgba(96,128,176,0.10),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_88%_100%,rgba(200,140,72,0.07),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(3,6,12,0.55)_100%)]" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
