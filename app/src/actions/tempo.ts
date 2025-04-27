import { maxBy, min, minBy } from "lodash"
import {
  TempoEventsClipboardData,
  isTempoEventsClipboardData,
} from "../clipboard/clipboardTypes"
import { isNotUndefined } from "../helpers/array"
import { useStores } from "../hooks/useStores"
import clipboard from "../services/Clipboard"
import { isSetTempoEvent } from "../track"

export const useDeleteTempoSelection = () => {
  const {
    song: { conductorTrack },
    tempoEditorStore,
    tempoEditorStore: { selectedEventIds },
    pushHistory,
  } = useStores()

  return () => {
    if (conductorTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    pushHistory()

    // 選択範囲と選択されたノートを削除
    // Remove selected notes and selected notes
    conductorTrack.removeEvents(selectedEventIds)
    tempoEditorStore.selection = null
  }
}

export const useResetTempoSelection = () => {
  const { tempoEditorStore } = useStores()

  return () => {
    tempoEditorStore.selection = null
    tempoEditorStore.selectedEventIds = []
  }
}

export const useCopyTempoSelection = () => {
  const {
    song: { conductorTrack },
    tempoEditorStore: { selectedEventIds },
  } = useStores()

  return () => {
    if (conductorTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    // Copy selected events
    const events = selectedEventIds
      .map((id) => conductorTrack.getEventById(id))
      .filter(isNotUndefined)
      .filter(isSetTempoEvent)

    const minTick = min(events.map((e) => e.tick))

    if (minTick === undefined) {
      return
    }

    const relativePositionedEvents = events.map((note) => ({
      ...note,
      tick: note.tick - minTick,
    }))

    const data: TempoEventsClipboardData = {
      type: "tempo_events",
      events: relativePositionedEvents,
    }

    clipboard.writeText(JSON.stringify(data))
  }
}

export const usePasteTempoSelection = () => {
  const {
    song: { conductorTrack },
    player,
    pushHistory,
  } = useStores()

  return () => {
    if (conductorTrack === undefined) {
      return
    }

    const text = clipboard.readText()
    if (!text || text.length === 0) {
      return
    }

    const obj = JSON.parse(text)
    if (!isTempoEventsClipboardData(obj)) {
      return
    }

    pushHistory()

    const events = obj.events.map((e) => ({
      ...e,
      tick: e.tick + player.position,
    }))
    conductorTrack.transaction((it) => {
      events.forEach((e) => it.createOrUpdate(e))
    })
  }
}

export const useDuplicateTempoSelection = () => {
  const {
    song: { conductorTrack },
    tempoEditorStore,
    tempoEditorStore: { selectedEventIds },
    pushHistory,
  } = useStores()

  return () => {
    if (conductorTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    pushHistory()

    const selectedEvents = selectedEventIds
      .map((id) => conductorTrack.getEventById(id))
      .filter(isNotUndefined)

    // move to the end of selection
    const deltaTick =
      (maxBy(selectedEvents, (e) => e.tick)?.tick ?? 0) -
      (minBy(selectedEvents, (e) => e.tick)?.tick ?? 0)

    const events = selectedEvents.map((note) => ({
      ...note,
      tick: note.tick + deltaTick,
    }))

    const addedEvents = conductorTrack.transaction((it) =>
      events.map((e) => it.createOrUpdate(e)),
    )

    // select the created events
    tempoEditorStore.selectedEventIds = addedEvents.map((e) => e.id)
  }
}
