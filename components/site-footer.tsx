import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="py-8">
      <div className="text-md mx-auto text-center text-muted-foreground">
        Fluent Emoji are MIT-licensed.
      </div>
      <div className="mx-auto py-2 text-center text-xs">
        © 2023 <Link href="https://www.ryu.app">ryu.app</Link>
      </div>
    </footer>
  )
}
