import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { Point } from "../../../../entities/geometry/Point"
import { ControlCoordTransform } from "../../../../entities/transform/ControlCoordTransform"
import { observeDrag2 } from "../../../../helpers/observeDrag"
import { useStores } from "../../../../hooks/useStores"
import { TrackEventOf } from "../../../../track"

export const useDragSelectionGesture = () => {
  const {
    controlStore,
    controlStore: { selectedTrack },
    pushHistory,
  } = useStores()
  return {
    onMouseDown<T extends ControllerEvent | PitchBendEvent>(
      e: MouseEvent,
      hitEventId: number,
      startPoint: Point,
      transform: ControlCoordTransform,
    ) {
      if (selectedTrack === undefined) {
        return
      }

      pushHistory()

      if (!controlStore.selectedEventIds.includes(hitEventId)) {
        controlStore.selectedEventIds = [hitEventId]
      }

      const controllerEvents = selectedTrack.events
        .filter((e) => controlStore.selectedEventIds.includes(e.id))
        .map((e) => ({ ...e }) as unknown as TrackEventOf<T>) // copy

      const draggedEvent = controllerEvents.find((ev) => ev.id === hitEventId)
      if (draggedEvent === undefined) {
        return
      }

      const startValue = transform.getValue(startPoint.y)

      observeDrag2(e, {
        onMouseMove: (_e, delta) => {
          const deltaTick = transform.getTick(delta.x)
          const offsetTick =
            draggedEvent.tick +
            deltaTick -
            controlStore.quantizer.round(draggedEvent.tick + deltaTick)
          const quantizedDeltaTick = deltaTick - offsetTick

          const currentValue = transform.getValue(startPoint.y + delta.y)
          const deltaValue = currentValue - startValue

          selectedTrack.updateEvents(
            controllerEvents.map((ev) => ({
              id: ev.id,
              tick: Math.max(0, Math.floor(ev.tick + quantizedDeltaTick)),
              value: Math.min(
                transform.maxValue,
                Math.max(0, Math.floor(ev.value + deltaValue)),
              ),
            })),
          )
        },

        onMouseUp: () => {
          // Find events with the same tick and remove it
          const controllerEvents = selectedTrack.events.filter((e) =>
            controlStore.selectedEventIds.includes(e.id),
          )

          selectedTrack.transaction((it) =>
            controllerEvents.forEach((e) => it.removeRedundantEvents(e)),
          )
        },
      })
    },
  }
}
