import { useToast } from "dialog-hooks"
import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import {
  useFastForwardOneBar,
  useNextTrack,
  useOpenSong,
  usePreviousTrack,
  useRewindOneBar,
  useStop,
  useToggleGhost,
  useToggleMute,
  useToggleRecording,
  useToggleSolo,
} from "../../actions"
import { hasFSAccess } from "../../actions/file"
import { useRedo, useUndo } from "../../actions/history"
import { useSongFile } from "../../hooks/useSongFile"
import { useStores } from "../../hooks/useStores"
import { useLocalization } from "../../localize/useLocalization"
import { FileInput } from "../Navigation/LegacyFileMenu"
import { KeyboardShortcut } from "./KeyboardShortcut"

export const GlobalKeyboardShortcut: FC = observer(() => {
  const { rootViewStore, router, player, song } = useStores()
  const rewindOneBar = useRewindOneBar()
  const fastForwardOneBar = useFastForwardOneBar()
  const stop = useStop()
  const nextTrack = useNextTrack()
  const previousTrack = usePreviousTrack()
  const toggleSolo = useToggleSolo()
  const toggleMute = useToggleMute()
  const toggleGhost = useToggleGhost()
  const toggleRecording = useToggleRecording()
  const undo = useUndo()
  const redo = useRedo()
  const openSongFile = useOpenSong()
  const { createNewSong, openSong, saveSong, saveAsSong, downloadSong } =
    useSongFile()
  const LegacyOpenId: string = "LegacyOpenButtonInputFile"
  const localized = useLocalization()
  const toast = useToast()

  const openLegacy = async () => {
    if (song.isSaved || confirm(localized["confirm-open"])) {
      document.getElementById(LegacyOpenId)?.click()
    }
  }

  useEffect(() => {
    // prevent zooming
    const onWheel = (e: WheelEvent) => {
      // Touchpad pinches are translated into wheel with ctrl event
      if (e.ctrlKey) {
        e.preventDefault()
      }
    }

    document.addEventListener("wheel", onWheel, { passive: false })

    // disable bounce scroll (Safari does not support overscroll-behavior CSS)
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
    }

    document.addEventListener("touchmove", onTouchMove, { passive: false })

    // do not allow to open the default context menu
    document.oncontextmenu = (e) => e.preventDefault()

    return () => {
      document.removeEventListener("wheel", onWheel)
      document.removeEventListener("touchmove", onTouchMove)
      document.oncontextmenu = null
    }
  }, [])

  return (
    <>
      <FileInput
        id={LegacyOpenId}
        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
          try {
            await openSongFile(e.currentTarget)
          } catch (e) {
            toast.error((e as Error).message)
          }
        }}
        accept="audio/midi"
      ></FileInput>
      <KeyboardShortcut
        actions={[
          // Play/Pause (Space)
          { code: "Space", run: () => player.playOrPause() },
          // Undo (Meta-Z)
          {
            code: "KeyZ",
            metaKey: true,
            run: undo,
          },
          // Redo (Shift-Meta-Z)
          {
            code: "KeyZ",
            metaKey: true,
            shiftKey: true,
            run: redo,
          },
          // Redo (Meta-Y)
          { code: "KeyY", metaKey: true, run: redo },
          // Help (?)
          {
            code: "Slash",
            shiftKey: true,
            run: () => (rootViewStore.openHelp = true),
          },
          // Stop (Enter)
          { code: "Enter", run: stop },
          // Rewind one bar (A)
          { code: "KeyA", run: rewindOneBar },
          // Fast forward one bar (D)
          { code: "KeyD", run: fastForwardOneBar },
          // Next track (S)
          { code: "KeyS", run: nextTrack },
          // Previous track (W)
          { code: "KeyW", run: previousTrack },
          // Toggle solo (N)
          { code: "KeyN", run: toggleSolo },
          // Toggle mute (M)
          { code: "KeyM", run: toggleMute },
          // Toggle recording (R)
          { code: "KeyR", run: toggleRecording },
          // Toggle ghost (,)
          { code: "Comma", run: toggleGhost },
          // Switch to piano roll (Meta-1)
          {
            code: "Digit1",
            metaKey: true,
            run: () => (router.path = "/track"),
          },
          // Switch to arrange roll (Meta-2)
          {
            code: "Digit2",
            metaKey: true,
            run: () => (router.path = "/arrange"),
          },
          // Switch to tempo roll (Meta-3)
          {
            code: "Digit3",
            metaKey: true,
            run: () => (router.path = "/tempo"),
          },
          // Save (Meta-S)
          {
            code: "KeyS",
            metaKey: true,
            run: hasFSAccess ? saveSong : downloadSong,
          },
          // Save (Alt-S)
          {
            code: "KeyS",
            altKey: true,
            run: hasFSAccess ? saveSong : downloadSong,
          },
          // Save As (Shift-Meta-S)
          {
            code: "KeyS",
            shiftKey: true,
            metaKey: true,
            run: hasFSAccess ? saveAsSong : downloadSong,
          },
          // Save As (Shift-Alt-S)
          {
            code: "KeyS",
            shiftKey: true,
            altKey: true,
            run: hasFSAccess ? saveAsSong : downloadSong,
          },
          // Open (Meta-O)
          {
            code: "KeyO",
            metaKey: true,
            run: hasFSAccess ? openSong : openLegacy,
          },
          // Open (Alt-O)
          {
            code: "KeyO",
            altKey: true,
            run: hasFSAccess ? openSong : openLegacy,
          },
          // New (Meta-N)
          {
            code: "KeyN",
            metaKey: true,
            run: createNewSong,
          },
          // New (Alt-N)
          {
            code: "KeyN",
            altKey: true,
            run: createNewSong,
          },
        ]}
      />
    </>
  )
})
