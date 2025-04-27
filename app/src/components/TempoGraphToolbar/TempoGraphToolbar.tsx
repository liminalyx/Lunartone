import styled from "@emotion/styled"
import { FC } from "react"
import { Localized } from "../../localize/useLocalization"
import { Toolbar } from "../Toolbar/Toolbar"
import { TempoGraphAutoScrollButton } from "./TempoGraphAutoScrollButton"
import { TempoGraphQuantizeSelector } from "./TempoGraphQuantizeSelector"
import { TempoGraphToolSelector } from "./TempoGraphToolSelector"

const Title = styled.span`
  font-weight: bold;
  margin-right: 2em;
  font-size: 1rem;
  margin-left: 0.5rem;
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

export const TempoGraphToolbar: FC = () => {
  return (
    <Toolbar>
      <Title>
        <Localized name="tempo" />
      </Title>

      <FlexibleSpacer />

      <TempoGraphToolSelector />

      <TempoGraphQuantizeSelector />

      <TempoGraphAutoScrollButton />
    </Toolbar>
  )
}
