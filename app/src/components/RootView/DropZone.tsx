import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC, PropsWithChildren, useCallback } from "react"
import { useSetSong } from "../../actions"
import { songFromFile } from "../../actions/file"
import { useStores } from "../../hooks/useStores"
import { useLocalization } from "../../localize/useLocalization"

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`

export const DropZone: FC<PropsWithChildren> = observer(({ children }) => {
  const { song } = useStores()
  const localized = useLocalization()
  const setSong = useSetSong()

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file.type !== "audio/midi" && file.type !== "audio/mid") {
        return
      }
      if (song.isSaved || confirm(localized["confirm-open"])) {
        const newSong = await songFromFile(file)
        setSong(newSong)
      }
    },
    [song, setSong],
  )

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      {children}
    </Container>
  )
})
