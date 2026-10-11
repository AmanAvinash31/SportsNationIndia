import { Link } from "wouter";
import { Container } from "@/components/site";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="font-display text-[clamp(5rem,3rem+10vw,12rem)] font-semibold leading-none text-primary">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">That page is out of bounds.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The link may be old or mistyped. Try the medal history or the latest news instead.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" data-testid="link-404-home" className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-bold text-primary-foreground">Back to home</Link>
        <Link href="/medals" className="inline-flex h-11 items-center rounded-full border border-border px-5 font-bold">Medal history</Link>
      </div>
    </Container>
  );
}
