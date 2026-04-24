// EventCard.tsx
import { Bookmark, Star } from "lucide-react-native";
import React, { useState } from "react";
import {
    AccessibilityRole,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { Event } from "../types/Event";

/**
 * Props:
 * - event: Event (same shape as your web Event type)
 * - onPress: called when the card is pressed
 * - hideBookmark?: hide the bookmark button (defaults to false)
 * - onBookmarkPress?: optional callback when user taps bookmark icon
 */
type Props = {
  event: Event;
  onPress: () => void;
  hideBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmarkPress?: (eventId?: string) => void;
  compact?: boolean;
};

export function EventCard({ event, onPress, hideBookmark = false, isBookmarked = false, onBookmarkPress, compact = false }: Props) {
  const [imageError, setImageError] = useState(false);

  const formatRating = (rating: unknown): string => {
    const numericRating = typeof rating === "number" ? rating : Number(rating);
    if (!Number.isFinite(numericRating)) return "0.0";
    return numericRating.toFixed(1);
  };

  const renderPricePoints = (pricePoint: number | undefined) => {
    // Keep same visual semantics as web: "$$", etc.
    return Array.from({ length: Math.max(0, pricePoint || 0) }, () => "$").join("");
  };

  const formatMonthDay = (date: Date): string => `${date.getMonth() + 1}/${date.getDate()}`;

  const normalizeDateToken = (value: unknown): string | null => {
    if (value == null) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : formatMonthDay(value);
    }
    if (typeof value === "object" && typeof (value as { toDate?: () => Date }).toDate === "function") {
      const timestampDate = (value as { toDate: () => Date }).toDate();
      return Number.isNaN(timestampDate.getTime()) ? null : formatMonthDay(timestampDate);
    }
    const raw = String(value).trim();
    if (!raw) return null;

    // Already in M/D or M/D/YYYY style.
    const usDate = raw.match(/^(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?$/);
    if (usDate) {
      return `${Number(usDate[1])}/${Number(usDate[2])}`;
    }

    // YYYY-MM-DD or ISO strings should keep their calendar day (avoid timezone shifting).
    const isoPrefix = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoPrefix) {
      return `${Number(isoPrefix[2])}/${Number(isoPrefix[3])}`;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return formatMonthDay(parsed);
    }
    return null;
  };

  const formatDate = () => {
    const rawStart = event.startDate;
    const rawEnd = event.endDate;
    if (!rawStart && !rawEnd) return "";

    let startToken: unknown = rawStart;
    let endToken: unknown = rawEnd;

    // Handle scraped range packed into a single startDate string.
    if (!endToken && typeof rawStart === "string") {
      const packedRange = rawStart.match(/^(.+?)\s(?:-|~|to)\s(.+)$/i);
      if (packedRange) {
        startToken = packedRange[1].trim();
        endToken = packedRange[2].trim();
      }
    }

    const startLabel = normalizeDateToken(startToken);
    const endLabel = normalizeDateToken(endToken);

    if (startLabel && endLabel) {
      return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
    }
    if (startLabel) return startLabel;
    if (endLabel) return endLabel;
    return String(rawStart ?? "");
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.cardPressed]}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={`Open ${event.name} details`}
    >
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        {!imageError && event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>{(event.name || "Event").slice(0, 2).toUpperCase()}</Text>
          </View>
        )}

        {event.startDate ? (
          <View style={[styles.dateBadge, compact && styles.dateBadgeCompact]}>
            <Text style={[styles.dateBadgeText, compact && styles.dateBadgeTextCompact]}>{formatDate()}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.meta, compact && styles.metaCompact]}>
        <View style={styles.left}>
          <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1} ellipsizeMode="tail">
            {event.name}
          </Text>

          <View style={[styles.row, compact && styles.rowCompact]}>
            <Text style={[styles.price, compact && styles.priceCompact]}>{renderPricePoints(event.pricePoint)}</Text>
            <Text style={[styles.dot, compact && styles.dotCompact]}>•</Text>
            <Text style={[styles.category, compact && styles.categoryCompact]} numberOfLines={1}>
              {event.category}
            </Text>
          </View>

          <Text style={[styles.city, compact && styles.cityCompact]} numberOfLines={1}>
            {event.city}
          </Text>
        </View>

        <View style={styles.right}>
          {!hideBookmark && (
            <TouchableOpacity
              onPress={() => onBookmarkPress?.(event.id)}
              style={[styles.bookmarkBtn, compact && styles.bookmarkBtnCompact]}
              accessibilityRole={"button"}
              accessibilityLabel={`Bookmark ${event.name}`}
            >
              <Bookmark size={compact ? 14 : 16} color={isBookmarked ? "#3b82f6" : "#4B5563"} fill={isBookmarked ? "#3b82f6" : "none"} />
            </TouchableOpacity>
          )}

          <View style={[styles.ratingRow, compact && styles.ratingRowCompact]}>
            <Star size={compact ? 10 : 12} color="#F59E0B" />
            <Text style={[styles.ratingText, compact && styles.ratingTextCompact]}>{formatRating(event.rating)}</Text>
          </View>

          <View style={[styles.distanceWrap, compact && styles.distanceWrapCompact]}>
            <Text style={[styles.distanceText, compact && styles.distanceTextCompact]}>{event.distance} mi</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardCompact: {
    borderRadius: 7,
  },
  cardPressed: {
    opacity: 0.9,
  },

  imageWrap: {
    height: 120,
    backgroundColor: "#E5E7EB",
    width: "100%",
    position: "relative",
  },
  imageWrapCompact: {
    height: 92,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#374151",
  },

  dateBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateBadgeCompact: {
    bottom: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  dateBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  dateBadgeTextCompact: {
    fontSize: 9,
  },

  meta: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  metaCompact: {
    padding: 10,
  },

  left: {
    flex: 1,
    paddingRight: 8,
    minWidth: 0,
  },

  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  titleCompact: {
    fontSize: 11,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  rowCompact: {
    marginBottom: 4,
  },
  price: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
    marginRight: 6,
  },
  priceCompact: {
    fontSize: 9,
  },
  dot: {
    fontSize: 11,
    color: "#9CA3AF",
    marginRight: 6,
  },
  dotCompact: {
    fontSize: 9,
  },
  category: {
    fontSize: 11,
    color: "#6B7280",
    flexShrink: 1,
  },
  categoryCompact: {
    fontSize: 9,
  },

  city: {
    fontSize: 10,
    color: "#6B7280",
  },
  cityCompact: {
    fontSize: 8,
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },

  bookmarkBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  bookmarkBtnCompact: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingRowCompact: {
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "700",
    marginLeft: 4,
  },
  ratingTextCompact: {
    fontSize: 8,
  },

  distanceWrap: {
    height: 14,
    justifyContent: "center",
  },
  distanceWrapCompact: {
    height: 12,
  },
  distanceText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  distanceTextCompact: {
    fontSize: 8,
  },
});