import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

import { ActionLog } from "@/components/ActionLog/ActionLog";
import { mapStyles } from "@/components/Map/mapStyles";
import { NearbyItemsPicker } from "@/components/Map/NearbyItemsPicker";
import { TeamSummary } from "@/components/Map/TeamSummary";
import { styles } from "@/components/Shared/styles";
import type { GameActionResponse, StationStateResponse, TeamResponse } from "@/types/game";
import type { MapSelectableItem } from "@/utils/mapSelection";

export function DesktopMapSidebar({
  actions,
  isGameCreated,
  isWideLayout,
  nearbyItems,
  onSelectNearbyItem,
  renderInspector,
  selectedChallengeId,
  selectedStationId,
  setupPanel,
  stations,
  teams,
  teamsById,
}: {
  actions: GameActionResponse[];
  isGameCreated: boolean;
  isWideLayout: boolean;
  nearbyItems: MapSelectableItem[];
  onSelectNearbyItem: (item: MapSelectableItem) => void;
  renderInspector: (hideHeader?: boolean) => ReactNode;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  setupPanel?: ReactNode;
  stations: StationStateResponse[];
  teams: TeamResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  return (
    <View
      style={[
        mapStyles.inspectorShell,
        isWideLayout ? mapStyles.inspectorShellWide : mapStyles.inspectorShellCompact,
      ]}
    >
      {isWideLayout && !isGameCreated ? <TeamSummary stations={stations} teams={teams} /> : null}
      <ScrollView
        contentContainerStyle={mapStyles.inspectorPanelWide}
        showsVerticalScrollIndicator={false}
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
        {renderInspector(false)}
      </ScrollView>
      {isWideLayout && !isGameCreated ? (
        <View style={mapStyles.actionLogPanel}>
          <View style={styles.panelHeader}>
            <Text style={mapStyles.actionLogTitle}>Action log</Text>
            <Text style={mapStyles.teamSummaryMeta}>{actions.length} entries</Text>
          </View>
          <ScrollView
            contentContainerStyle={mapStyles.actionLogContent}
            showsVerticalScrollIndicator
            style={mapStyles.actionLogScroller}
          >
            <ActionLog actions={actions} hideTitle />
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
