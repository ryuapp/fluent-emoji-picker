import { siteConfig } from "#config/site.ts";
import { buttonVariants } from "#components/ui/button.tsx";
import { Icons } from "#components/icons.tsx";
import { EmojiPicker } from "#components/emoji-picker.tsx";

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl leading-tight font-extrabold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
          Fluent Emoji are a collection of <br className="hidden sm:inline" />
          familiar, friendly, and modern emoji{" "}
          <br className="hidden sm:inline" />
          from Microsoft.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          You can easily copy Fluent Emoji in SVG format.
        </p>
      </div>
      <div className="flex gap-4">
        <a
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.icons}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Icons
          <Icons.gitHub className="ml-2 size-5" />
          <span className="sr-only">GitHub</span>
        </a>
        <a
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.website}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Website
          <Icons.gitHub className="ml-2 size-5" />
          <span className="sr-only">GitHub</span>
        </a>
      </div>
      <EmojiPicker />
    </section>
  );
}
