import NodeEnvironment from "jest-environment-node"

export default class CustomEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup()
    // mock navigator.language
    this.global.navigator = {
      language: "kk",
    } as Navigator
    this.global.location = {
      href: "https://lunartone.vercel.app/",
    } as Location
  }
}
