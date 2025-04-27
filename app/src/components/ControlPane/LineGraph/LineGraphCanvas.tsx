import { GLCanvas, Transform } from "@ryohey/webgl-react"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useMemo } from "react"
import { Point } from "../../../entities/geometry/Point"
import { Rect } from "../../../entities/geometry/Rect"
import { ControlCoordTransform } from "../../../entities/transform/ControlCoordTransform"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLNodes/Beats"
import { Cursor } from "../../GLNodes/Cursor"
import { Selection } from "../../GLNodes/Selection"
import { LineGraphItems } from "./LineGraphItems"

interface IDValue {
  id: number
}

export interface LineGraphCanvasProps {
  width: number
  height: number
  maxValue: number
  items: (Point & IDValue)[]
  controlPoints: (Rect & IDValue)[]
  style?: CSSProperties
  onMouseDown: React.MouseEventHandler<Element>
  onContextMenu: React.MouseEventHandler<Element>
}

const lineWidth = 2

export const LineGraphCanvas: FC<LineGraphCanvasProps> = observer(
  ({
    items,
    width,
    height,
    style,
    maxValue,
    controlPoints,
    onMouseDown,
    onContextMenu,
  }) => {
    const {
      controlStore: {
        selection,
        scrollLeft,
        selectedEventIds,
        cursorX,
        transform,
        rulerStore: { beats },
      },
    } = useStores()

    const controlTransform = useMemo(
      () => new ControlCoordTransform(transform, maxValue, height, lineWidth),
      [transform.horizontalId, maxValue, height],
    )

    const selectionRect =
      selection !== null ? controlTransform.transformSelection(selection) : null

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-Math.floor(scrollLeft), 0),
      [scrollLeft],
    )

    return (
      <GLCanvas
        width={width}
        height={height}
        onMouseDown={onMouseDown}
        onContextMenu={onContextMenu}
        style={style}
      >
        <Transform matrix={scrollXMatrix}>
          <Beats height={height} beats={beats} zIndex={0} />
          <LineGraphItems
            scrollLeft={scrollLeft}
            width={width}
            items={items}
            selectedEventIds={selectedEventIds}
            controlPoints={controlPoints}
            lineWidth={2}
            zIndex={1}
          />
          <Selection rect={selectionRect} zIndex={2} />
          <Cursor x={cursorX} height={height} zIndex={3} />
        </Transform>
      </GLCanvas>
    )
  },
)
