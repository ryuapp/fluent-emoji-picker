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
        className="h-16 w-16 text-center rounded border hover:bg-accent cursor-pointer"
      >
        <img
          id={"emoji-" + id}
          className="mt-4 mx-auto transition ease-in-out select-none"
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
