import { eventsInSelection } from "../../../../actions"
import { Point } from "../../../../entities/geometry/Point"
import { Selection } from "../../../../entities/selection/Selection"
import { MouseGesture } from "../../../../gesture/MouseGesture"
import { observeDrag2 } from "../../../../helpers/observeDrag"
import { useStores } from "../../../../hooks/useStores"

// 選択範囲外でクリックした場合は選択範囲をリセット
export const useCreateSelectionGesture = (): MouseGesture => {
  const {
    pianoRollStore,
    pianoRollStore: { transform, quantizer, selectedTrack },
    player,
    controlStore,
  } = useStores()

  return {
    onMouseDown(e) {
      if (selectedTrack === undefined) {
        return
      }

      const local = pianoRollStore.getLocal(e)
      const start = transform.getNotePointFractional(local)
      const startPos = local

      if (!player.isPlaying) {
        player.position = quantizer.round(start.tick)
      }

      controlStore.selectedEventIds = []
      pianoRollStore.selection = Selection.fromPoints(start, start)

      observeDrag2(e, {
        onMouseMove: (_e, delta) => {
          const offsetPos = Point.add(startPos, delta)
          const end = transform.getNotePointFractional(offsetPos)
          pianoRollStore.selection = Selection.fromPoints(
            { ...start, tick: quantizer.round(start.tick) },
            { ...end, tick: quantizer.round(end.tick) },
          )
        },

        onMouseUp: () => {
          const { selection } = pianoRollStore
          if (selection === null) {
            return
          }

          // 選択範囲を確定して選択範囲内のノートを選択状態にする
          // Confirm the selection and select the notes in the selection state
          pianoRollStore.selectedNoteIds = eventsInSelection(
            selectedTrack.events,
            selection,
          ).map((e) => e.id)
        },
      })
    },
  }
}
