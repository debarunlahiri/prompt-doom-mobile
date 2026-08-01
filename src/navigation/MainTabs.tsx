import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "../hooks/useColors";
import { ExploreScreen } from "../screens/ExploreScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { UserGalleryScreen } from "../screens/UserGalleryScreen";
import { MainTabParamList } from "../types";

const Tabs = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const icons: Record<
    keyof MainTabParamList,
    [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]
  > = {
    Home: ["home-outline", "home"],
    Explore: ["compass-outline", "compass"],
    Favorites: ["heart-outline", "heart"],
    History: ["time-outline", "time"],
    Profile: ["person-outline", "person"],
  };
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 58 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 7,
        },
        tabBarItemStyle: {
          paddingBottom: 2,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={icons[route.name][focused ? 1 : 0]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Explore" component={ExploreScreen} />
      <Tabs.Screen name="Favorites">{() => <UserGalleryScreen />}</Tabs.Screen>
      <Tabs.Screen name="History">
        {() => <UserGalleryScreen history />}
      </Tabs.Screen>
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
