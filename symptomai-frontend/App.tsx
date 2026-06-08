import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import MedicineScanScreen from "./src/screens/MedicineScanScreen";

type Tab = "home" | "scan";

const TAB_BAR_HEIGHT = 60;
const TAB_BAR_BOTTOM_PAD = Platform.OS === "ios" ? 24 : 8;

interface TabItemProps {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}

function TabItem({ icon, label, active, onPress }: TabItemProps) {
  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
      {active && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <View style={styles.root}>
      {/* Screen area */}
      <View style={styles.screenArea}>
        {activeTab === "home" ? <HomeScreen /> : <MedicineScanScreen />}
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: TAB_BAR_BOTTOM_PAD }]}>
        <TabItem
          icon="🩺"
          label="Gejala"
          active={activeTab === "home"}
          onPress={() => setActiveTab("home")}
        />
        <TabItem
          icon="💊"
          label="Scan Obat"
          active={activeTab === "scan"}
          onPress={() => setActiveTab("scan")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  screenArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_PAD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    position: "relative",
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    width: 32,
    height: 3,
    backgroundColor: "#2563EB",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
