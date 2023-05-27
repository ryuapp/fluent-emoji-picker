import Link from "next/link"

import { siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="py-8">
      <div className="text-md mx-auto text-center text-muted-foreground">
        Fluent Emoji are MIT-licensed.
      </div>
      <div className="mx-auto py-2 text-center text-xs">
        © {siteConfig.copyright.year}{" "}
        <Link href={siteConfig.copyright.link}>
          {siteConfig.copyright.author}
        </Link>
      </div>
    </footer>
  )
}
