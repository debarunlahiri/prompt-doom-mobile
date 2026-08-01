import { useColorScheme } from "react-native";
import { useAppStore } from "../store";
import { AppColors, darkColors, lightColors } from "../theme";

export function useColors(): AppColors {
  const system = useColorScheme();
  const preference = useAppStore((state) => state.theme);
  return (preference === "system" ? system : preference) === "dark"
    ? darkColors
    : lightColors;
}
