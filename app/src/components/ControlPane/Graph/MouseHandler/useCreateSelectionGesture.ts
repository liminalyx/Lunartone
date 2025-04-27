import { Point } from "../../../../entities/geometry/Point"
import { ControlSelection } from "../../../../entities/selection/ControlSelection"
import { ControlCoordTransform } from "../../../../entities/transform/ControlCoordTransform"
import { observeDrag2 } from "../../../../helpers/observeDrag"
import { useStores } from "../../../../hooks/useStores"

export const useCreateSelectionGesture = () => {
  const {
    pianoRollStore,
    controlStore,
    controlStore: { quantizer },
    player,
  } = useStores()

  return {
    onMouseDown(
      e: MouseEvent,
      startPoint: Point,
      controlTransform: ControlCoordTransform,
      getControllerEventIdsInSelection: (
        selection: ControlSelection,
      ) => number[],
    ) {
      controlStore.selectedEventIds = []

      const startTick = quantizer.round(controlTransform.getTick(startPoint.x))

      pianoRollStore.selection = null
      pianoRollStore.selectedNoteIds = []

      if (!player.isPlaying) {
        player.position = startTick
      }

      controlStore.selection = {
        fromTick: startTick,
        toTick: startTick,
      }

      observeDrag2(e, {
        onMouseMove: (_e, delta) => {
          const local = Point.add(startPoint, delta)
          const endTick = quantizer.round(controlTransform.getTick(local.x))
          controlStore.selection = {
            fromTick: Math.min(startTick, endTick),
            toTick: Math.max(startTick, endTick),
          }
        },
        onMouseUp: () => {
          const { selection } = controlStore
          if (selection === null) {
            return
          }

          controlStore.selectedEventIds =
            getControllerEventIdsInSelection(selection)
          controlStore.selection = null
        },
      })
    },
  }
}
