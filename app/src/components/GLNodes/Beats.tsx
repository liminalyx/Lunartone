import { useTheme } from "@emotion/react"
import Color from "color"
import { partition } from "lodash"
import { FC, useMemo } from "react"
import { BeatWithX } from "../../entities/beat/BeatWithX"
import { colorToVec4 } from "../../gl/color"
import { VerticalLines } from "./VerticalLines"

export const Beats: FC<{
  height: number
  beats: BeatWithX[]
  zIndex: number
}> = ({ height, beats, zIndex }) => {
  const theme = useTheme()

  const [highlightedBeats, nonHighlightedBeats] = partition(
    beats,
    (b) => b.beat === 0,
  )

  const lines = nonHighlightedBeats.map((b) => b.x)
  const highlightedLines = highlightedBeats.map((b) => b.x)

  const color = useMemo(
    () => colorToVec4(Color(theme.editorSecondaryGridColor)),
    [theme],
  )
  const highlightedColor = useMemo(
    () => colorToVec4(Color(theme.editorGridColor)),
    [theme],
  )

  return (
    <>
      <VerticalLines
        xArray={lines}
        color={color}
        height={height}
        lineWidth={1}
        zIndex={zIndex}
      />
      <VerticalLines
        xArray={highlightedLines}
        color={highlightedColor}
        height={height}
        lineWidth={1}
        zIndex={zIndex + 0.1}
      />
    </>
  )
}
