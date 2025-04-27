import { FC } from "react"
import { ThemeType } from "./Theme"

export const ThemeName: FC<{ themeType: ThemeType }> = ({ themeType }) => {
  switch (themeType) {
    case "dark":
      return "Қара/Темная/Dark"
    case "light":
      return "Ақ/Светлая/White"
    default:
      return "Белгісіз/Неизвестная/Unknown"
  }
}
