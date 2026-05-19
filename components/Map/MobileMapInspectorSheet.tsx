import { MaterialIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { mapStyles } from "@/components/Map/mapStyles";
import { NearbyItemsPicker } from "@/components/Map/NearbyItemsPicker";
import { styles } from "@/components/Shared/styles";
import type { StationStateResponse, TeamResponse } from "@/types/game";
import { colors } from "@/utils/colors";
import type { MapSelectableItem } from "@/utils/mapSelection";

export function MobileMapInspectorSheet({
  isExpanded,
  nearbyItems,
  onSelectNearbyItem,
  onToggleExpanded,
  renderInspector,
  selectedChallengeId,
  selectedStationId,
  setupPanel,
  shouldShow,
  stations,
  subtitle,
  teamsById,
  title,
}: {
  isExpanded: boolean;
  nearbyItems: MapSelectableItem[];
  onSelectNearbyItem: (item: MapSelectableItem) => void;
  onToggleExpanded: () => void;
  renderInspector: (hideHeader?: boolean) => ReactNode;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  setupPanel?: ReactNode;
  shouldShow: boolean;
  stations: StationStateResponse[];
  subtitle: string;
  teamsById: Map<string, TeamResponse>;
  title: string;
}) {
  if (!shouldShow) {
    return null;
  }

  return (
    <View
      style={[
        mapStyles.mobileInspectorSheet,
        isExpanded || setupPanel
          ? mapStyles.mobileInspectorSheetExpanded
          : mapStyles.mobileInspectorSheetCollapsed,
      ]}
    >
      <Pressable
        accessibilityLabel={isExpanded ? "Collapse inspector" : "Expand inspector"}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded || Boolean(setupPanel) }}
        disabled={Boolean(setupPanel)}
        onPress={onToggleExpanded}
        style={mapStyles.mobileInspectorHandle}
      >
        <View style={mapStyles.mobileInspectorGrip} />
        <View style={mapStyles.mobileInspectorHeader}>
          <View style={styles.actionBody}>
            <Text numberOfLines={1} style={mapStyles.mobileInspectorTitle}>
              {title}
            </Text>
            <Text numberOfLines={1} style={mapStyles.mobileInspectorSubtitle}>
              {subtitle}
            </Text>
          </View>
          {setupPanel ? null : (
            <MaterialIcons
              color={colors.textSoft}
              name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"}
              size={24}
            />
          )}
        </View>
      </Pressable>

      <ScrollView
        contentContainerStyle={mapStyles.inspectorContent}
        showsVerticalScrollIndicator={isExpanded || Boolean(setupPanel)}
        style={mapStyles.inspectorScroller}
      >
        {setupPanel}
        <NearbyItemsPicker
          items={nearbyItems}
          onSelectItem={onSelectNearbyItem}
          selectedChallengeId={selectedChallengeId}
          selectedStationId={selectedStationId}
          stations={stations}
          teamsById={teamsById}
        />
        {renderInspector(true)}
      </ScrollView>
    </View>
  );
}
