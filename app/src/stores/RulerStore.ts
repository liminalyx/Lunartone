import { computed, makeObservable, observable } from "mobx"
import { BeatWithX } from "../entities/beat/BeatWithX"
import { Range } from "../entities/geometry/Range"
import { TickTransform } from "../entities/transform/TickTransform"
import { isEventInRange } from "../helpers/filterEvents"
import Quantizer from "../quantizer"
import { SongStore } from "./SongStore"

interface RulerProvider {
  transform: TickTransform
  scrollLeft: number
  canvasWidth: number
  quantizer: Quantizer
}

export interface TimeSignature {
  id: number
  tick: number
  numerator: number
  denominator: number
  isSelected: boolean
}

export class RulerStore {
  selectedTimeSignatureEventIds: number[] = []

  constructor(
    readonly parent: RulerProvider,
    private readonly songStore: SongStore,
  ) {
    makeObservable(this, {
      selectedTimeSignatureEventIds: observable.shallow,
      beats: computed,
      timeSignatures: computed,
      quantizer: computed,
    })
  }

  get beats(): BeatWithX[] {
    const { scrollLeft, transform, canvasWidth } = this.parent
    const {
      song: { measures, timebase },
    } = this.songStore

    return BeatWithX.createInRange(
      measures,
      transform,
      timebase,
      scrollLeft,
      canvasWidth,
    )
  }

  get timeSignatures(): TimeSignature[] {
    const { transform, scrollLeft, canvasWidth } = this.parent
    const { selectedTimeSignatureEventIds } = this
    const {
      song: { timeSignatures },
    } = this.songStore

    return timeSignatures
      .filter(
        isEventInRange(
          Range.fromLength(
            transform.getTick(scrollLeft),
            transform.getTick(canvasWidth),
          ),
        ),
      )
      .map((e) => ({
        ...e,
        isSelected: selectedTimeSignatureEventIds.includes(e.id),
      }))
  }

  get quantizer(): Quantizer {
    return this.parent.quantizer
  }

  getTick(offsetX: number) {
    const { transform, scrollLeft } = this.parent
    return transform.getTick(offsetX + scrollLeft)
  }

  getQuantizedTick(offsetX: number) {
    const { quantizer } = this.parent
    return quantizer.round(this.getTick(offsetX))
  }
}
