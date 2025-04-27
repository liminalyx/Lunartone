import { useTheme } from "@emotion/react"
import Color from "color"
import { observer } from "mobx-react-lite"
import { FC, useMemo } from "react"
import { Layout } from "../../../Constants"
import { KeySignature } from "../../../entities/scale/KeySignature"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { HorizontalGrid } from "./HorizontalGrid"

function keySignatureToConditions(keySignature: KeySignature) {
  const intervals = KeySignature.getIntervals(keySignature)
  return new Array(12).fill(false).map((_, i) => intervals.includes(i % 12))
}

export const Lines: FC<{ zIndex: number }> = observer(({ zIndex }) => {
  const theme = useTheme()
  const {
    pianoRollStore: {
      scrollTop,
      canvasWidth,
      canvasHeight,
      scaleY,
      keySignature,
    },
  } = useStores()

  const laneColors = useMemo(() => {
    const whiteLaneColor = colorToVec4(
      Color(theme.pianoWhiteKeyLaneColor),
    ) as number[]

    const blackLaneColor = colorToVec4(
      Color(theme.pianoBlackKeyLaneColor),
    ) as number[]

    if (keySignature === null) {
      return Float32Array.from(
        Array(12)
          .fill(0)
          .map((_, i) =>
            KeySignature.getIntervals({ scale: "major", key: 0 }).includes(i)
              ? whiteLaneColor
              : blackLaneColor,
          )
          .flat(),
      )
    }

    const highlightedKeys = keySignatureToConditions(keySignature)

    const highlightedLaneColor = colorToVec4(
      Color(theme.pianoHighlightedLaneColor),
    ) as number[]

    const laneColors = highlightedKeys.map((isHighlighted) =>
      isHighlighted ? highlightedLaneColor : whiteLaneColor,
    )

    return Float32Array.from(laneColors.flat())
  }, [theme, keySignature])

  const color = useMemo(
    () => colorToVec4(Color(theme.pianoLaneEdgeColor)),
    [theme],
  )

  const hightlightedColor = useMemo(
    () => colorToVec4(Color(theme.editorGridColor)),
    [theme],
  )

  return (
    <HorizontalGrid
      rect={{
        x: 0,
        y: scrollTop,
        width: canvasWidth,
        height: canvasHeight,
      }}
      color={color}
      highlightedColor={hightlightedColor}
      laneColors={laneColors}
      height={scaleY * Layout.keyHeight}
      zIndex={zIndex}
    />
  )
})
