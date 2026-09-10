import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";
import { useColors } from "../hooks/useColors";
import { styles } from "../styles";

export function AmbientBackground() {
  const colors = useColors();

  return (
    <View pointerEvents="none" style={styles.ambientBackground}>
      <Image
        source={require("../../assets/main_bg.jpg")}
        style={styles.ambientBackgroundImage}
        contentFit="cover"
        contentPosition="center"
        blurRadius={44}
        cachePolicy="memory-disk"
      />
      <View
        style={[
          styles.ambientBackgroundOverlay,
          { backgroundColor: `${colors.background}C7` },
        ]}
      />
    </View>
  );
}
