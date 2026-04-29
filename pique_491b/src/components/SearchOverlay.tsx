// SearchOverlay.tsx (React Native)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGetEvents } from "@/api";
import { ArrowLeft, MapPin, Mic, Search, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RECENT_SEARCHES_KEY = "@pique_recent_searches";
const MAX_RECENT_SEARCHES = 8;
const EVENT_SUGGESTION_FETCH_LIMIT = 120;
const MAX_EVENT_SUGGESTION_POOL = 200;
const MAX_SEARCH_SUGGESTIONS = 6;

type IntentRule = {
  keywords: string[];
  suggestions: string[];
};

const INTENT_RULES: IntentRule[] = [
  {
    keywords: ["feat", "featuring", "concert", "music", "band", "artist", "dj", "tour", "gig", "show"],
    suggestions: ["Live Music", "Outdoor Concerts", "Entertainment"],
  },
  {
    keywords: ["comedy", "standup", "laugh", "comic"],
    suggestions: ["Comedy Shows", "Entertainment"],
  },
  {
    keywords: ["dance", "party", "club"],
    suggestions: ["Dance Classes", "Entertainment"],
  },
  {
    keywords: ["museum", "art", "culture", "gallery", "theater"],
    suggestions: ["Arts & Culture", "Museum Tours", "Theater Performances"],
  },
  {
    keywords: ["yoga", "fitness", "wellness", "health"],
    suggestions: ["Wellness", "Fitness Bootcamp", "Outdoor Yoga Classes"],
  },
];

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildBigrams(value: string): string[] {
  if (value.length < 2) return [value];
  const out: string[] = [];
  for (let i = 0; i < value.length - 1; i += 1) {
    out.push(value.slice(i, i + 2));
  }
  return out;
}

function diceSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const aBigrams = buildBigrams(a);
  const bBigrams = buildBigrams(b);
  const bCounts = new Map<string, number>();
  for (const bi of bBigrams) bCounts.set(bi, (bCounts.get(bi) ?? 0) + 1);
  let overlap = 0;
  for (const bi of aBigrams) {
    const count = bCounts.get(bi) ?? 0;
    if (count > 0) {
      overlap += 1;
      bCounts.set(bi, count - 1);
    }
  }
  return (2 * overlap) / (aBigrams.length + bBigrams.length);
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
  onNavigateToExplore: (category: string) => void;
  onNavigateToFindPeople?: () => void;
  location?: string;
  onLocationChange?: (location: string) => void;
};

function isLikelyUsernameQuery(value: string): boolean {
  const q = value.trim();
  if (!q) return false;
  if (q.includes(" ")) return false;
  const normalized = q.startsWith("@") ? q.slice(1) : q;
  if (normalized.length < 3 || normalized.length > 32) return false;
  if (!/^[a-zA-Z0-9_.]+$/.test(normalized)) return false;
  return /[a-zA-Z]/.test(normalized);
}

export function SearchOverlay({
  isOpen,
  onClose,
  initialQuery,
  onNavigateToExplore,
  onNavigateToFindPeople,
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

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [eventNameSuggestions, setEventNameSuggestions] = useState<string[]>([]);
  const [eventCategorySuggestions, setEventCategorySuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((raw) => {
      if (raw) setRecentSearches(JSON.parse(raw));
    }).catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadEventSuggestions = async () => {
      try {
        const response = await apiGetEvents({ limit: EVENT_SUGGESTION_FETCH_LIMIT, withCursor: true });
        const events = Array.isArray((response as any)?.events)
          ? (response as any).events
          : (Array.isArray(response) ? response : []);
        const seen = new Set<string>();
        const names: string[] = [];
        const categorySeen = new Set<string>();
        const categories: string[] = [];

        for (const event of events) {
          const rawName = String(event?.name ?? "").trim();
          if (!rawName) continue;
          const key = rawName.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          names.push(rawName);

          const rawCategory = String(event?.category ?? "").trim();
          if (rawCategory) {
            const catKey = rawCategory.toLowerCase();
            if (!categorySeen.has(catKey)) {
              categorySeen.add(catKey);
              categories.push(rawCategory);
            }
          }

          if (Array.isArray(event?.categories)) {
            for (const rawCat of event.categories) {
              const nextCategory = String(rawCat ?? "").trim();
              if (!nextCategory) continue;
              const catKey = nextCategory.toLowerCase();
              if (categorySeen.has(catKey)) continue;
              categorySeen.add(catKey);
              categories.push(nextCategory);
            }
          }

          if (names.length >= MAX_EVENT_SUGGESTION_POOL) break;
        }

        if (!cancelled) {
          setEventNameSuggestions(names);
          setEventCategorySuggestions(categories);
        }
      } catch {
        if (!cancelled) {
          setEventNameSuggestions([]);
          setEventCategorySuggestions([]);
        }
      }
    };

    loadEventSuggestions();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const saveSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((s) => s.toLowerCase() !== query.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem(RECENT_SEARCHES_KEY).catch(() => {});
  }, []);

  const suggestions = useMemo(() => {
    if (!searchText.trim()) return [];
    const categorySuggestions = [
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
      ...quickActions,
      ...eventCategorySuggestions,
    ];
    const q = searchText.trim();
    const normalizedQuery = normalizeForCompare(q);
    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    const rankByMatchQuality = (value: string): number => {
      const normalizedValue = normalizeForCompare(value);
      if (normalizedValue.startsWith(normalizedQuery)) return 0;
      if (normalizedValue.includes(` ${normalizedQuery}`)) return 1;
      return 2;
    };
    const scoreSuggestion = (value: string): number => {
      const normalizedValue = normalizeForCompare(value);
      if (!normalizedValue) return 0;
      let score = 0;
      if (normalizedValue.startsWith(normalizedQuery)) score += 1;
      if (normalizedValue.includes(normalizedQuery)) score += 0.55;
      const tokenHits = queryTokens.filter((token) => normalizedValue.includes(token)).length;
      if (queryTokens.length > 0) score += (tokenHits / queryTokens.length) * 0.45;
      score += diceSimilarity(normalizedQuery, normalizedValue) * 0.7;
      return score;
    };
    const byRelevance = (a: string, b: string) => {
      const scoreDiff = scoreSuggestion(b) - scoreSuggestion(a);
      if (Math.abs(scoreDiff) > 0.0001) return scoreDiff;
      const rankDiff = rankByMatchQuality(a) - rankByMatchQuality(b);
      if (rankDiff !== 0) return rankDiff;
      const lengthDiff = a.length - b.length;
      if (lengthDiff !== 0) return lengthDiff;
      return a.localeCompare(b);
    };
    const matchingEventNames = eventNameSuggestions
      .filter((name) => normalizeForCompare(name).includes(normalizedQuery))
      .sort(byRelevance);
    const matchingCategories = categorySuggestions
      .filter((suggestion) => normalizeForCompare(suggestion).includes(normalizedQuery))
      .sort(byRelevance);
    const inferredIntentSuggestions = INTENT_RULES
      .filter((rule) =>
        rule.keywords.some((keyword) => queryTokens.some((token) => token.includes(keyword) || keyword.includes(token)))
      )
      .flatMap((rule) => rule.suggestions);
    const fuzzyEventNames = eventNameSuggestions
      .filter((name) => !normalizeForCompare(name).includes(normalizedQuery))
      .map((name) => ({ name, score: scoreSuggestion(name) }))
      .filter((row) => row.score >= 0.52)
      .sort((a, b) => b.score - a.score)
      .map((row) => row.name);
    const fuzzyCategories = categorySuggestions
      .filter((suggestion) => !normalizeForCompare(suggestion).includes(normalizedQuery))
      .map((suggestion) => ({ suggestion, score: scoreSuggestion(suggestion) }))
      .filter((row) => row.score >= 0.46)
      .sort((a, b) => b.score - a.score)
      .map((row) => row.suggestion);

    const combined: string[] = [];
    const seen = new Set<string>();
    for (const suggestion of [
      ...matchingEventNames,
      ...matchingCategories,
      ...inferredIntentSuggestions,
      ...fuzzyEventNames,
      ...fuzzyCategories,
    ]) {
      const key = suggestion.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      combined.push(suggestion);
      if (combined.length >= MAX_SEARCH_SUGGESTIONS) break;
    }
    return combined;
  }, [eventCategorySuggestions, eventNameSuggestions, quickActions, searchText]);
  const showFindPeopleHint = useMemo(
    () => !isLocationMode && isLikelyUsernameQuery(searchText),
    [isLocationMode, searchText]
  );

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
    saveSearch(q);
    onNavigateToExplore(q);
    onClose();
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchText(suggestion);
    saveSearch(suggestion);
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
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
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
                {showFindPeopleHint && (
                  <View style={styles.findPeopleHintWrap}>
                    <Text style={styles.findPeopleHintText}>
                      Looking for a user? Try{" "}
                      <Text
                        style={styles.findPeopleHintLink}
                        onPress={() => {
                          onClose();
                          onNavigateToFindPeople?.();
                        }}
                      >
                        finding people
                      </Text>{" "}
                      in the Community page!
                    </Text>
                  </View>
                )}

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
                      <TouchableOpacity onPress={clearRecentSearches}>
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
  findPeopleHintWrap: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  findPeopleHintText: {
    fontSize: 13,
    color: "#1E3A8A",
    lineHeight: 18,
  },
  findPeopleHintLink: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "700",
    marginHorizontal: 1,
    lineHeight: 18,
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