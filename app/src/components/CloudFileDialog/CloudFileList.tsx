import { useTheme } from "@emotion/react"
import styled from "@emotion/styled"
import { CloudSong } from "@signal-app/api"
import { useToast } from "dialog-hooks"
import ArrowDownward from "mdi-react/ArrowDownwardIcon"
import ArrowDropDown from "mdi-react/ArrowDropDownIcon"
import ArrowUpward from "mdi-react/ArrowUpwardIcon"
import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { useSetSong } from "../../actions"
import { useLoadSong } from "../../actions/cloudSong"
import { useStores } from "../../hooks/useStores"
import { Localized, useLocalization } from "../../localize/useLocalization"
import { CircularProgress } from "../ui/CircularProgress"
import { IconButton } from "../ui/IconButton"
import { Menu, MenuItem } from "../ui/Menu"
import { CloudFileRow } from "./CloudFileRow"

const ArrowUp = styled(ArrowUpward)`
  width: 1.1rem;
  height: 1.1rem;
`

const ArrowDown = styled(ArrowDownward)`
  width: 1.1rem;
  height: 1.1rem;
`

const HeaderCell = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.backgroundColor};
  font-weight: ${({ isSelected }: { isSelected?: boolean }) =>
    isSelected ? "bold" : "normal"};
  cursor: pointer;
  padding: 0 1rem;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const NameCell = styled(HeaderCell)`
  flex-grow: 1;
`

const DateCell = styled(HeaderCell)`
  width: 12rem;
`

const MenuCell = styled(HeaderCell)`
  width: 4rem;
`

const Body = styled.div`
  max-height: 20rem;
  overflow-y: auto;

  tr:hover td {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const SortButton: FC<{ sortAscending: boolean }> = ({ sortAscending }) =>
  sortAscending ? <ArrowDown /> : <ArrowUp />

const Container = styled.div``

const Header = styled.div`
  display: flex;
  height: 2.5rem;
`

export const CloudFileList = observer(() => {
  const { cloudFileStore, rootViewStore } = useStores()
  const setSong = useSetSong()
  const loadSong = useLoadSong()
  const toast = useToast()
  const theme = useTheme()
  const localized = useLocalization()
  const { isLoading, dateType, files, selectedColumn, sortAscending } =
    cloudFileStore

  useEffect(() => {
    cloudFileStore.load()
  }, [])

  const onClickSong = async (song: CloudSong) => {
    try {
      const midiSong = await loadSong(song)
      setSong(midiSong)
      rootViewStore.openCloudFileDialog = false
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  if (isLoading) {
    return <CircularProgress />
  }

  if (files.length === 0) {
    return <Localized name="no-files" />
  }

  const sortLabel = (() => {
    switch (dateType) {
      case "created":
        return localized["created-date"]
      case "updated":
        return localized["modified-date"]
    }
  })()

  return (
    <Container>
      <Header>
        <NameCell
          onClick={() => {
            if (cloudFileStore.selectedColumn === "name") {
              cloudFileStore.sortAscending = !cloudFileStore.sortAscending
            } else {
              cloudFileStore.selectedColumn = "name"
            }
          }}
          isSelected={selectedColumn === "name"}
        >
          <Localized name="name" />
          <div style={{ width: "0.5rem" }}></div>
          {selectedColumn === "name" && (
            <SortButton sortAscending={sortAscending} />
          )}
        </NameCell>
        <DateCell
          onClick={() => {
            if (cloudFileStore.selectedColumn === "date") {
              cloudFileStore.sortAscending = !cloudFileStore.sortAscending
            } else {
              cloudFileStore.selectedColumn = "date"
            }
          }}
          isSelected={selectedColumn === "date"}
        >
          {sortLabel}
          <Menu
            trigger={
              <IconButton
                style={{
                  marginLeft: "0.2em",
                }}
              >
                <ArrowDropDown style={{ fill: theme.secondaryTextColor }} />
              </IconButton>
            }
          >
            <MenuItem onClick={() => (cloudFileStore.dateType = "created")}>
              <Localized name="created-date" />
            </MenuItem>
            <MenuItem onClick={() => (cloudFileStore.dateType = "updated")}>
              <Localized name="modified-date" />
            </MenuItem>
          </Menu>
          {selectedColumn === "date" && (
            <SortButton sortAscending={sortAscending} />
          )}
        </DateCell>
        <MenuCell></MenuCell>
      </Header>
      <Body>
        {files.map((song) => (
          <CloudFileRow
            key={song.id}
            song={song}
            dateType={dateType}
            onClick={() => onClickSong(song)}
          />
        ))}
      </Body>
    </Container>
  )
})
