export function StickyMobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-rule bg-paper/95 p-3 backdrop-blur md:hidden">
      <a href="#qualify" className="btn btn-primary" data-cta="sticky-fit">
        Check my fit
      </a>
      <a href="#listen" className="btn btn-ghost" data-cta="sticky-listen">
        Listen
      </a>
    </div>
  );
}
