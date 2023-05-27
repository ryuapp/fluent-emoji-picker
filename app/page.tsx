"use client"

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import EmojiGallery from "@/components/emoji-gallery"
import { Icons } from "@/components/icons"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
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
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.icons}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Icons
          <Icons.gitHub className="ml-2 h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </Link>
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.website}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Website
          <Icons.gitHub className="ml-2 h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </Link>
      </div>
      <EmojiGallery />
    </section>
  )
}
