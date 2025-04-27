import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useMemo, useRef } from "react"
import { FixedSizeList, ListChildComponentProps } from "react-window"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { Localized } from "../../localize/useLocalization"
import { TrackEvent } from "../../track"
import { EventListItem } from "./EventListItem"

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const Header = styled.div`
  height: ${Layout.rulerHeight};
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
  /* scroll bar width */
  padding-right: 14px;
`

export const Row = styled.div`
  display: grid;
  outline: none;
  grid-template-columns: 5em 1fr 5em 5em;

  &:focus {
    background: ${({ theme }) => theme.highlightColor};
  }
`

export const Cell = styled.div`
  padding: 0.5rem;

  &:focus-within {
    background: ${({ theme }) => theme.highlightColor};
  }
`

const EventList: FC = observer(() => {
  const {
    pianoRollStore: { selectedTrack, selectedNoteIds: selectedEventIds = [] },
  } = useStores()

  const events = useMemo(() => {
    const { events = [] } = selectedTrack || {}
    if (selectedEventIds.length > 0) {
      return events.filter((event) => selectedEventIds.indexOf(event.id) >= 0)
    }
    return events
  }, [selectedTrack?.events, selectedEventIds])

  const ref = useRef<HTMLDivElement>(null)
  const size = useComponentSize(ref)

  return (
    <Container ref={ref}>
      <Header>
        <Row>
          <Cell>
            <Localized name="tick" />
          </Cell>
          <Cell>
            <Localized name="event" />
          </Cell>
          <Cell>
            <Localized name="duration" />
          </Cell>
          <Cell>
            <Localized name="value" />
          </Cell>
        </Row>
      </Header>
      <FixedSizeList
        height={size.height - Layout.rulerHeight}
        itemCount={events.length}
        itemSize={35}
        width={size.width}
        itemData={{ events }}
        itemKey={(index) => events[index].id}
      >
        {ItemRenderer}
      </FixedSizeList>
    </Container>
  )
})

const ItemRenderer = ({ index, style, data }: ListChildComponentProps) => {
  const { events, setSelectedEventIds } = data
  const e = events[index]

  const onClickRow = useCallback((e: React.MouseEvent, ev: TrackEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedEventIds?.((ids: number[]) => [...ids, ev.id])
    } else {
      setSelectedEventIds?.([ev.id])
    }
  }, [])

  return (
    <EventListItem style={style} item={e} key={e.id} onClick={onClickRow} />
  )
}

export default EventList
