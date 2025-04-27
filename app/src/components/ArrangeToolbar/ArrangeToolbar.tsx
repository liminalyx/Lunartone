import styled from "@emotion/styled"
import { FC } from "react"
import { Localized } from "../../localize/useLocalization"
import { Toolbar } from "../Toolbar/Toolbar"
import { ArrangeAutoScrollButton } from "./ArrangeAutoScrollButton"
import { ArrangeQuantizeSelector } from "./ArrangeQuantizeSelector"

const Title = styled.div`
  font-weight: bold;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 14rem;
  min-width: 3em;
  margin-left: 0.5rem;
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

export const ArrangeToolbar: FC = () => {
  return (
    <Toolbar>
      <Title>
        <Localized name="arrangement-view" />
      </Title>

      <FlexibleSpacer />

      <ArrangeQuantizeSelector />

      <ArrangeAutoScrollButton />
    </Toolbar>
  )
}
