import { useCopySelection, useDeleteSelection, usePasteSelection } from "."
import {
  useCopyControlSelection,
  useDeleteControlSelection,
  usePasteControlSelection,
} from "../actions/control"
import {
  isControlEventsClipboardData,
  isPianoNotesClipboardData,
} from "../clipboard/clipboardTypes"
import { useStores } from "../hooks/useStores"
import Clipboard from "../services/Clipboard"
import {
  useArrangeCopySelection,
  useArrangeDeleteSelection,
  useArrangePasteSelection,
} from "./arrangeView"
import {
  useCopyTempoSelection,
  useDeleteTempoSelection,
  usePasteTempoSelection,
} from "./tempo"

export const useCopySelectionGlobal = () => {
  const { router, pianoRollStore, controlStore } = useStores()
  const copySelection = useCopySelection()
  const arrangeCopySelection = useArrangeCopySelection()
  const copyTempoSelection = useCopyTempoSelection()
  const copyControlSelection = useCopyControlSelection()

  return () => {
    switch (router.path) {
      case "/track":
        if (pianoRollStore.selectedNoteIds.length > 0) {
          copySelection()
        } else if (controlStore.selectedEventIds.length > 0) {
          copyControlSelection()
        }
        break
      case "/arrange":
        arrangeCopySelection()
        break
      case "/tempo":
        copyTempoSelection()
        break
    }
  }
}

export const useCutSelectionGlobal = () => {
  const { router, pianoRollStore, controlStore } = useStores()
  const copySelection = useCopySelection()
  const deleteSelection = useDeleteSelection()
  const arrangeCopySelection = useArrangeCopySelection()
  const arrangeDeleteSelection = useArrangeDeleteSelection()
  const copyTempoSelection = useCopyTempoSelection()
  const deleteTempoSelection = useDeleteTempoSelection()
  const copyControlSelection = useCopyControlSelection()
  const deleteControlSelection = useDeleteControlSelection()

  return () => {
    switch (router.path) {
      case "/track":
        if (pianoRollStore.selectedNoteIds.length > 0) {
          copySelection()
          deleteSelection()
        } else if (controlStore.selectedEventIds.length > 0) {
          copyControlSelection()
          deleteControlSelection()
        }
        break
      case "/arrange":
        arrangeCopySelection()
        arrangeDeleteSelection()
        break
      case "/tempo":
        copyTempoSelection()
        deleteTempoSelection()
        break
    }
  }
}

export const usePasteSelectionGlobal = () => {
  const { router } = useStores()
  const pasteSelection = usePasteSelection()
  const arrangePasteSelection = useArrangePasteSelection()
  const pasteTempoSelection = usePasteTempoSelection()
  const pasteControlSelection = usePasteControlSelection()

  return () => {
    switch (router.path) {
      case "/track": {
        const text = Clipboard.readText()
        if (!text || text.length === 0) {
          return
        }
        const obj = JSON.parse(text)
        if (isPianoNotesClipboardData(obj)) {
          pasteSelection()
        } else if (isControlEventsClipboardData(obj)) {
          pasteControlSelection()
        }
        break
      }
      case "/arrange":
        arrangePasteSelection()
        break
      case "/tempo":
        pasteTempoSelection()
    }
  }
}
