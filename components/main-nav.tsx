import Link from "next/link";
import { siteConfig } from "#config/site.ts";
import { Icons } from "#components/icons.tsx";

export function MainNav() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Icons.logo className="size-6" />
      <span className="hidden font-bold sm:inline-block">
        {siteConfig.name}
      </span>
    </Link>
  );
}
