import { getEmojiList } from "@/lib/emoji"

import { EmojiCard } from "./emoji-card"

export default function EmojiGallery() {
  const emojiList = getEmojiList()
  const emojiCardList: JSX.Element[] = []

  emojiList.forEach((emoji) => {
    const folderName = emoji.path.replace("’", "")
    // folderName = folderName.replace(/:/g, "")
    const fileName = folderName.replace(/\s/g, "_").toLowerCase()
    const imgPath = process.env.EMOJI_URL
    emojiCardList.push(
      emoji.skintones ? (
        <EmojiCard
          key={emoji.id}
          id={emoji.id}
          name={emoji.name}
          path={
            imgPath +
            folderName +
            "/" +
            "Default" +
            "/Flat/" +
            fileName +
            "_flat_" +
            "Default".toLowerCase() +
            ".svg"
          }
        />
      ) : (
        <EmojiCard
          key={emoji.id}
          id={emoji.id}
          name={emoji.name}
          path={imgPath + folderName + "/Flat/" + fileName + "_flat.svg"}
        />
      )
    )
  })

  return <ul className="flex flex-wrap gap-2">{emojiCardList}</ul>
}
