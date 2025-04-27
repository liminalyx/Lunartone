import { useTheme } from "@emotion/react"
import { BorderedCircles, Rectangles } from "@ryohey/webgl-react"
import Color from "color"
import { partition } from "lodash"
import { FC } from "react"
import { Point } from "../../../entities/geometry/Point"
import { Rect } from "../../../entities/geometry/Rect"
import { colorToVec4 } from "../../../gl/color"
import { joinObjects } from "../../../helpers/array"

export interface LineGraphItemsProps {
  width: number
  scrollLeft: number
  items: (Point & { id: number })[]
  controlPoints: (Rect & { id: number })[]
  selectedEventIds: number[]
  lineWidth: number
  zIndex: number
}

export const LineGraphItems: FC<LineGraphItemsProps> = ({
  width,
  scrollLeft,
  items,
  selectedEventIds,
  controlPoints,
  lineWidth,
  zIndex,
}) => {
  const theme = useTheme()
  const right = scrollLeft + width
  const values = items.map((i) => ({ ...i, id: i.id }))
  const rects = createLineRects(values, lineWidth, right)
  const [highlightedItems, nonHighlightedItems] = partition(
    controlPoints,
    (i) => selectedEventIds.includes(i.id),
  )

  return (
    <>
      <Rectangles
        rects={rects}
        color={colorToVec4(Color(theme.themeColor))}
        zIndex={zIndex}
      />
      <BorderedCircles
        rects={nonHighlightedItems}
        zIndex={zIndex + 0.1}
        strokeColor={colorToVec4(Color(theme.themeColor))}
        fillColor={colorToVec4(Color(theme.themeColor))}
      />
      <BorderedCircles
        rects={highlightedItems}
        zIndex={zIndex + 0.2}
        strokeColor={colorToVec4(Color(theme.themeColor))}
        fillColor={colorToVec4(Color(theme.textColor))}
      />
    </>
  )
}

const createLineRects = (
  values: Point[],
  lineWidth: number,
  right: number,
): Rect[] => {
  const horizontalLineRects = values.map(({ x, y }, i) => {
    const next = values[i + 1]
    const nextX = next ? next.x : right // 次がなければ右端まで描画する
    return {
      x,
      y: y - lineWidth / 2,
      width: nextX - x,
      height: lineWidth,
    }
  })

  // add vertical lines between horizontal lines
  return joinObjects<Rect>(horizontalLineRects, (prev, next) => {
    const y = Math.min(prev.y, next.y)
    const height = Math.abs(prev.y - next.y) + lineWidth
    return {
      x: next.x - lineWidth / 2,
      y,
      width: lineWidth,
      height,
    }
  })
}
