import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function EmojiOptions() {
  return (
    <div>
      <h2 className="mb-2">Options</h2>
      <div className="flex">
        <div className="flex items-center space-x-2">
          <Label>Name</Label>
          <Switch onClick={toggleEmojiName} />
        </div>
      </div>
    </div>
  )
}

function toggleEmojiName() {
  const emojiGallery = document.getElementById("emoji-gallery")
  const isDisabledEmojiName = emojiGallery?.classList.contains(
    "disabled-emoji-name"
  )
  if (isDisabledEmojiName) {
    emojiGallery?.classList.remove("disabled-emoji-name")
  } else {
    emojiGallery?.classList.add("disabled-emoji-name")
  }
}
