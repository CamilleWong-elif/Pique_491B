// SearchOverlay.tsx (React Native)
import { ArrowLeft, MapPin, Mic, Search, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
  onNavigateToExplore: (category: string) => void;
  location?: string;
  onLocationChange?: (location: string) => void;
};

export function SearchOverlay({
  isOpen,
  onClose,
  initialQuery,
  onNavigateToExplore,
  location: propLocation,
  onLocationChange,
}: Props) {
  const [searchText, setSearchText] = useState(initialQuery);
  const [location, setLocation] = useState(propLocation || "Los Angeles, CA");
  const [isLocationMode, setIsLocationMode] = useState(false);
  const [locationSearchText, setLocationSearchText] = useState("");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setSearchText(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (propLocation) setLocation(propLocation);
  }, [propLocation]);

  const allCities = useMemo(
    () => [
      { city: "Anaheim", state: "CA" },
      { city: "Garden Grove", state: "CA" },
      { city: "Long Beach", state: "CA" },
      { city: "Los Angeles", state: "CA" },
      { city: "Westminster", state: "CA" },
    ],
    []
  );

  const filteredCities = useMemo(() => {
    if (!locationSearchText.trim()) return allCities;
    const q = locationSearchText.toLowerCase();
    return allCities.filter((loc) =>
      `${loc.city}, ${loc.state}`.toLowerCase().includes(q)
    );
  }, [locationSearchText, allCities]);

  const quickActions = useMemo(
    () => ["Entertainment", "Arts & Culture", "Wellness"],
    []
  );

  const recentSearches = useMemo(
    () => ["Paint and Sip Classes", "Yoga Studios", "Live Music Venues", "Comedy Shows"],
    []
  );

  const suggestions = useMemo(() => {
    if (!searchText.trim()) return [];
    const allSuggestions = [
      "Outdoor Activities",
      "Outdoor Yoga Classes",
      "Outdoor Concerts",
      "Hiking Groups",
      "Rock Climbing",
      "Kayaking Adventures",
      "Beach Volleyball",
      "Cycling Tours",
      "Arts & Crafts Workshops",
      "Paint and Sip",
      "Pottery Classes",
      "Dance Classes",
      "Fitness Bootcamp",
      "Comedy Shows",
      "Live Music",
      "Theater Performances",
      "Museum Tours",
      "Wine Tasting",
      "Cooking Classes",
      "Photography Walks",
    ];
    const q = searchText.toLowerCase();
    return allSuggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
  }, [searchText]);

  const handleLocationSelect = (city: string, state: string) => {
    const next = `${city}, ${state}`;
    setLocation(next);
    setIsLocationMode(false);
    setLocationSearchText("");
    onLocationChange?.(next);
  };

  const handleCurrentLocation = () => {
    const next = "Los Angeles, CA";
    setLocation(next);
    setIsLocationMode(false);
    setLocationSearchText("");
    onLocationChange?.(next);
  };

  const handleSearchSubmit = () => {
    const q = searchText.trim();
    if (!q) return;
    onNavigateToExplore(q);
    onClose();
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchText(suggestion);
    onNavigateToExplore(suggestion);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalRoot}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 8 : insets.top }]}>
            {/* Top Bar */}
            <View style={styles.topRow}>
              <TouchableOpacity
                onPress={() => {
                  if (isLocationMode) {
                    setIsLocationMode(false);
                    setLocationSearchText("");
                  } else {
                    onClose();
                  }
                }}
                style={styles.iconHit}
              >
                <ArrowLeft size={20} color="#374151" />
              </TouchableOpacity>

              <View style={styles.searchBox}>
                {!isLocationMode ? (
                  <>
                    <Search size={16} color="#9CA3AF" />
                    <TextInput
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholder="Type or search with your voice"
                      placeholderTextColor="#9CA3AF"
                      style={styles.searchInput}
                      autoFocus
                      returnKeyType="search"
                      onSubmitEditing={handleSearchSubmit}
                    />
                    {!!searchText && (
                      <TouchableOpacity
                        onPress={() => setSearchText("")}
                        style={styles.iconHitSm}
                      >
                        <X size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.locationBox}>
                    <MapPin size={18} color="#9CA3AF" />
                    <TextInput
                      value={locationSearchText}
                      onChangeText={setLocationSearchText}
                      placeholder="Neighborhood, city, state or zip code"
                      placeholderTextColor="#9CA3AF"
                      style={styles.searchInput}
                      autoFocus
                    />
                    {!!locationSearchText && (
                      <TouchableOpacity
                        onPress={() => setLocationSearchText("")}
                        style={styles.iconHitSm}
                      >
                        <X size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.iconHit}>
                <Mic size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Location row */}
            {!isLocationMode ? (
              <TouchableOpacity
                onPress={() => setIsLocationMode(true)}
                style={styles.locationRow}
              >
                <MapPin size={18} color="#6B7280" />
                <Text style={styles.locationLabel}>Current Location</Text>
                <Text style={styles.locationValue}>{location}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isLocationMode ? (
              <View>
                <TouchableOpacity
                  onPress={handleCurrentLocation}
                  style={[styles.listRow, styles.listRowBorder]}
                >
                  <Text style={styles.currentLocText}>Current Location</Text>
                </TouchableOpacity>

                <FlatList
                  data={filteredCities.slice(0, 20)}
                  keyExtractor={(item, idx) => `${item.city}-${item.state}-${idx}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleLocationSelect(item.city, item.state)}
                      style={[styles.listRow, styles.listRowBorder]}
                    >
                      <MapPin size={16} color="#9CA3AF" />
                      <Text style={styles.cityText}>
                        {item.city}, {item.state}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.scrollPad} keyboardShouldPersistTaps="handled">
                {/* Quick actions */}
                {!searchText.trim() && (
                  <View style={styles.quickWrap}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {quickActions.map((a) => (
                        <TouchableOpacity
                          key={a}
                          onPress={() => handleSuggestionPress(a)}
                          style={styles.chip}
                        >
                          <Text style={styles.chipText}>{a}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUGGESTIONS</Text>
                    {suggestions.map((s, idx) => (
                      <TouchableOpacity
                        key={`${s}-${idx}`}
                        onPress={() => handleSuggestionPress(s)}
                        style={styles.suggestRow}
                      >
                        <Search size={16} color="#9CA3AF" />
                        <Text style={styles.suggestText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Recently searched */}
                {!searchText.trim() && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionTitle}>RECENTLY SEARCHED</Text>
                      <TouchableOpacity>
                        <Text style={styles.clearText}>Clear</Text>
                      </TouchableOpacity>
                    </View>

                    {recentSearches.map((s, idx) => (
                      <TouchableOpacity
                        key={`${s}-${idx}`}
                        onPress={() => handleSuggestionPress(s)}
                        style={styles.suggestRow}
                      >
                        <Search size={16} color="#9CA3AF" />
                        <Text style={styles.suggestText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>

        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  modalRoot: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  iconHit: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconHitSm: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  locationLabel: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
  },
  locationValue: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: "auto",
  },
  content: {
    flex: 1,
  },
  scrollPad: {
    paddingBottom: 32,
  },
  quickWrap: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    color: "#111827",
  },
  section: {
    borderTopWidth: 0,
    paddingTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "700",
    letterSpacing: 1,
  },
  clearText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  suggestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  suggestText: {
    fontSize: 14,
    color: "#111827",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  currentLocText: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
  },
  cityText: {
    fontSize: 15,
    color: "#111827",
  },
  });