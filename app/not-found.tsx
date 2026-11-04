import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-grid py-24">
      <p className="eyebrow mb-4">404</p>
      <h1 className="h2 md:text-5xl">That page isn&apos;t here.</h1>
      <p className="mt-4 text-ink-2">
        If you heard a link on the podcast, try the{" "}
        <Link href="/" className="link">
          homepage
        </Link>{" "}
        or go straight to the{" "}
        <Link href="/qualify" className="link">
          90-second fit check
        </Link>
        .
      </p>
    </div>
  );
}
