import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ImageViewing from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";

interface FullScreenImageViewerProps {
  visible: boolean;
  imageUrl: string;
  title: string;
  onClose: () => void;
}

export function FullScreenImageViewer({
  visible,
  imageUrl,
  title,
  onClose,
}: FullScreenImageViewerProps) {
  return (
    <ImageViewing
      images={[{ uri: imageUrl }]}
      imageIndex={0}
      visible={visible}
      onRequestClose={onClose}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
      backgroundColor="#050505"
      HeaderComponent={() => (
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close image viewer"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>
      )}
      FooterComponent={() => (
        <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
          <View style={styles.hint}>
            <Ionicons name="scan-outline" size={17} color="#FFFFFF" />
            <Text style={styles.hintText}>
              Pinch or double-tap to zoom · Swipe down to close
            </Text>
          </View>
        </SafeAreaView>
      )}
    />
  );
}

const styles = StyleSheet.create({
  headerSafeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  header: {
    minHeight: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: { flex: 1, color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  footerSafeArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  hint: {
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  hintText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
});
