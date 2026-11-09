import Link from "next/link";
import ArrowLeft from "lucide-react/icons/arrow-left";
import { EmojiGame } from "#components/emoji-game.tsx";

export default function NotFound() {
  return (
    <section className="not-found-scene relative isolate overflow-hidden">
      <div className="container grid min-h-[calc(100svh-13rem)] items-center gap-12 py-12 lg:grid-cols-2 lg:gap-20 lg:py-20">
        <div className="mx-auto w-full max-w-lg text-center lg:text-left">
          <div
            aria-hidden="true"
            className="mb-6 flex items-center justify-center gap-1 text-[clamp(7rem,16vw,11rem)] leading-none font-black tracking-tighter lg:justify-start"
          >
            4
            <img
              src="/icon.svg"
              alt=""
              width={144}
              height={144}
              className="size-[0.78em] -rotate-12"
            />
            4
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            This page melted away.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-muted-foreground lg:mx-0">
            We couldn’t find what you were looking for. But we did find a little
            game for your detour.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full border bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to the
            emojis
          </Link>
        </div>
        <EmojiGame />
      </div>
    </section>
  );
}
