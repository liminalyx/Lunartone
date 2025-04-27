import { clamp, cloneDeep } from "lodash"
import { action, computed, makeObservable, observable } from "mobx"
import { Layout } from "../Constants"
import { BAR_WIDTH } from "../components/inputs/ScrollBar"
import { Range } from "../entities/geometry/Range"
import { Rect } from "../entities/geometry/Rect"
import { ArrangeSelection } from "../entities/selection/ArrangeSelection"
import { ArrangeCoordTransform } from "../entities/transform/ArrangeCoordTransform"
import { NoteCoordTransform } from "../entities/transform/NoteCoordTransform"
import { isEventOverlapRange } from "../helpers/filterEvents"
import Quantizer from "../quantizer"
import { isNoteEvent, TrackId } from "../track"
import RootStore from "./RootStore"
import { RulerStore } from "./RulerStore"
import { TickScrollStore } from "./TickScrollStore"

export type SerializedArrangeViewStore = Pick<
  ArrangeViewStore,
  "selection" | "selectedEventIds"
>

export default class ArrangeViewStore {
  readonly rulerStore: RulerStore
  private readonly tickScrollStore: TickScrollStore

  scaleX = 1
  scaleY = 1
  SCALE_Y_MIN = 0.5
  SCALE_Y_MAX = 4
  selection: ArrangeSelection | null = null
  selectedEventIds: { [key: number]: number[] } = {} // { trackIndex: [eventId] }
  autoScroll = true
  quantize = 1
  scrollLeftTicks = 0
  scrollTop = 0
  canvasWidth = 0
  canvasHeight = 0
  selectedTrackIndex = 0
  openTransposeDialog = false
  openVelocityDialog = false

  constructor(readonly rootStore: RootStore) {
    this.rootStore = rootStore
    this.rulerStore = new RulerStore(this, rootStore.songStore)
    this.tickScrollStore = new TickScrollStore(this, 0.15, 15)

    makeObservable(this, {
      scaleX: observable,
      scaleY: observable,
      selection: observable.shallow,
      selectedEventIds: observable,
      autoScroll: observable,
      quantize: observable,
      scrollLeftTicks: observable,
      scrollTop: observable,
      canvasWidth: observable,
      canvasHeight: observable,
      selectedTrackIndex: observable,
      openTransposeDialog: observable,
      openVelocityDialog: observable,
      scrollLeft: computed,
      transform: computed,
      trackTransform: computed,
      notes: computed,
      cursorX: computed,
      trackHeight: computed,
      selectionRect: computed,
      contentWidth: computed,
      contentHeight: computed,
      quantizer: computed,
      selectedTrackId: computed,
      setScrollLeftInPixels: action,
      setScrollTop: action,
    })
  }

  setUpAutorun() {
    this.tickScrollStore.setUpAutoScroll()
  }

  serialize(): SerializedArrangeViewStore {
    return {
      selection: cloneDeep(this.selection),
      selectedEventIds: cloneDeep(this.selectedEventIds),
    }
  }

  restore(state: SerializedArrangeViewStore) {
    this.selection = state.selection
    this.selectedEventIds = state.selectedEventIds
  }

  get scrollLeft(): number {
    return this.tickScrollStore.scrollLeft
  }

  setScrollLeftInPixels(x: number) {
    this.tickScrollStore.setScrollLeftInPixels(x)
  }

  setScrollTop(value: number) {
    const maxOffset =
      this.contentHeight + Layout.rulerHeight + BAR_WIDTH - this.canvasHeight
    this.scrollTop = clamp(value, 0, maxOffset)
  }

  scrollBy(x: number, y: number) {
    this.setScrollLeftInPixels(this.scrollLeft - x)
    this.setScrollTop(this.scrollTop - y)
  }

  scaleAroundPointX(scaleXDelta: number, pixelX: number) {
    this.tickScrollStore.scaleAroundPointX(scaleXDelta, pixelX)
  }

  setScaleY(scaleY: number) {
    this.scaleY = clamp(scaleY, this.SCALE_Y_MIN, this.SCALE_Y_MAX)
    this.setScrollTop(this.scrollTop)
  }

  resetSelection() {
    this.selection = null
    this.selectedEventIds = {}
  }

  get contentWidth(): number {
    return this.tickScrollStore.contentWidth
  }

  get contentHeight(): number {
    return this.trackTransform.getY(this.rootStore.song.tracks.length)
  }

  get transform(): NoteCoordTransform {
    return new NoteCoordTransform(
      Layout.pixelsPerTick * this.scaleX,
      0.5 * this.scaleY,
      127,
    )
  }

  get trackTransform(): ArrangeCoordTransform {
    const { transform, trackHeight } = this
    return new ArrangeCoordTransform(transform, trackHeight)
  }

  get trackHeight(): number {
    const { transform } = this
    const bottomBorderWidth = 1
    return (
      Math.ceil(transform.pixelsPerKey * transform.numberOfKeys) +
      bottomBorderWidth
    )
  }

  get notes(): Rect[] {
    const { transform, trackTransform, scrollLeft, canvasWidth, scaleY } = this

    return this.rootStore.song.tracks
      .map((t, i) =>
        t.events
          .filter(
            isEventOverlapRange(
              Range.fromLength(
                transform.getTick(scrollLeft),
                transform.getTick(canvasWidth),
              ),
            ),
          )
          .filter(isNoteEvent)
          .map((e) => {
            const rect = transform.getRect(e)
            return {
              ...rect,
              height: scaleY,
              y: trackTransform.getY(i) + rect.y,
            }
          }),
      )
      .flat()
  }

  get cursorX(): number {
    return this.transform.getX(this.rootStore.player.position)
  }

  get selectionRect(): Rect | null {
    const { selection, trackTransform } = this
    if (selection === null) {
      return null
    }
    const x = trackTransform.getX(selection.fromTick)
    const right = trackTransform.getX(selection.toTick)
    const y = trackTransform.getY(selection.fromTrackIndex)
    const bottom = trackTransform.getY(selection.toTrackIndex)
    return {
      x,
      width: right - x,
      y,
      height: bottom - y,
    }
  }

  get quantizer(): Quantizer {
    return new Quantizer(this.rootStore, this.quantize, true)
  }

  get selectedTrackId(): TrackId {
    return this.rootStore.song.tracks[this.selectedTrackIndex].id
  }
}
