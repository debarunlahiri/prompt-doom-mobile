import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  DarkTheme,
  DefaultTheme,
  LinkingOptions,
  NavigationContainer,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { LEGAL_CONTENT } from "../config";
import { useColors } from "../hooks/useColors";
import { AuthScreen } from "../screens/AuthScreen";
import { CategoriesScreen } from "../screens/CategoriesScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { ExploreScreen } from "../screens/ExploreScreen";
import { ImageDetailScreen } from "../screens/ImageDetailScreen";
import { LegalScreen } from "../screens/LegalScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { PasswordFlowScreen } from "../screens/PasswordFlowScreen";
import { PromptScreen } from "../screens/PromptScreen";
import { ReportScreen } from "../screens/ReportScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { darkColors } from "../theme";
import { RootStackParamList } from "../types";
import { formatSlug } from "../utils/format";
import { MainTabs } from "./MainTabs";

const Stack = createNativeStackNavigator<RootStackParamList>();
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["promptdoom://"],
  config: {
    screens: {
      ImageDetail: {
        path: "image/:imageId",
        parse: { imageId: Number },
      },
    },
  },
};

export function AppNavigator() {
  const colors = useColors();
  const dark = colors === darkColors;
  const navigationTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };
  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          {() => <AuthScreen />}
        </Stack.Screen>
        <Stack.Screen
          name="ImageDetail"
          component={ImageDetailScreen}
          options={{ title: "" }}
        />
        <Stack.Screen
          name="Prompt"
          component={PromptScreen}
          options={{ title: "Prompt" }}
        />
        <Stack.Screen
          name="Search"
          options={({ route }) => ({
            title: route.params?.category
              ? formatSlug(route.params.category)
              : route.params?.tag
                ? formatSlug(route.params.tag)
                : "Explore",
          })}
        >
          {() => <ExploreScreen showHeader={false} />}
        </Stack.Screen>
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ title: "Categories" }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: "Edit profile" }}
        />
        <Stack.Screen
          name="ChangePassword"
          options={{ title: "Change password" }}
        >
          {() => <PasswordFlowScreen />}
        </Stack.Screen>
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: "" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
        <Stack.Screen
          name="Legal"
          component={LegalScreen}
          options={({ route }) => ({
            title: LEGAL_CONTENT[route.params.page].title,
          })}
        />
        <Stack.Screen
          name="Report"
          component={ReportScreen}
          options={{ title: "Report image" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
