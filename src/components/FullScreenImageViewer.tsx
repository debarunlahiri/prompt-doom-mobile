import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
  const [detailsVisible, setDetailsVisible] = useState(true);

  useEffect(() => {
    if (visible) {
      setDetailsVisible(true);
    }
  }, [visible]);

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
          <View style={styles.footerControls}>
            {detailsVisible && (
              <View style={styles.details}>
                <Text numberOfLines={2} style={styles.title}>
                  {title}
                </Text>
                <View style={styles.hintRow}>
                  <Ionicons name="scan-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.hintText}>
                    Pinch or double-tap to zoom · Swipe down to close
                  </Text>
                </View>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                detailsVisible ? "Hide image details" : "Show image details"
              }
              onPress={() => setDetailsVisible((current) => !current)}
              style={({ pressed }) => [
                styles.visibilityButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons
                name={detailsVisible ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
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
    justifyContent: "flex-end",
  },
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
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  footerControls: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  details: {
    flex: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  hintText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  visibilityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
});
