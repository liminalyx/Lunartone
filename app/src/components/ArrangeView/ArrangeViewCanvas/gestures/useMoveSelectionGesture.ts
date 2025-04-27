import { MouseEvent } from "react"
import { useArrangeMoveSelection } from "../../../../actions"
import { Point } from "../../../../entities/geometry/Point"
import { Rect } from "../../../../entities/geometry/Rect"
import { MouseGesture } from "../../../../gesture/MouseGesture"
import { getClientPos } from "../../../../helpers/mouseEvent"
import { observeDrag } from "../../../../helpers/observeDrag"
import { useStores } from "../../../../hooks/useStores"

export const useMoveSelectionGesture = (): MouseGesture<
  [Point, Rect],
  MouseEvent
> => {
  const {
    pushHistory,
    arrangeViewStore: { trackTransform },
  } = useStores()

  const arrangeMoveSelection = useArrangeMoveSelection()

  return {
    onMouseDown(_e, startClientPos, selectionRect) {
      let isMoved = false
      observeDrag({
        onMouseMove: (e) => {
          const deltaPx = Point.sub(getClientPos(e), startClientPos)
          const selectionFromPx = Point.add(deltaPx, selectionRect)

          if ((deltaPx.x !== 0 || deltaPx.y !== 0) && !isMoved) {
            isMoved = true
            pushHistory()
          }

          arrangeMoveSelection(trackTransform.getArrangePoint(selectionFromPx))
        },
      })
    },
  }
}
