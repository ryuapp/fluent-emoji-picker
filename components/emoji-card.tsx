export function EmojiCard({
  id,
  name,
  path,
}: {
  id: number
  name: string
  path: string
}) {
  return (
    <li className="list-none">
      <div
        id={"emoji-card-" + id}
        className="h-16 w-16 cursor-pointer rounded border text-center hover:bg-accent"
      >
        <img
          id={"emoji-" + id}
          className="mx-auto mt-4 select-none transition ease-in-out"
          src={path}
          alt={name}
          width={32}
          height={32}
          loading="lazy"
        />
      </div>
      <div id="emoji-name" className="w-16 text-center text-xs">
        {name}
      </div>
    </li>
  )
}
