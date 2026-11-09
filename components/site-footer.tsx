import { siteConfig } from "#config/site.ts";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="py-8">
      <div className="text-md mx-auto text-center text-muted-foreground">
        <Link href="/licenses" className="underline-offset-4 hover:underline">
          Licenses &amp; notices
        </Link>
      </div>
      <div className="mx-auto py-2 text-center text-xs">
        © {siteConfig.copyright.year}{" "}
        <a href={siteConfig.copyright.link}>{siteConfig.copyright.author}</a>
      </div>
    </footer>
  );
}
