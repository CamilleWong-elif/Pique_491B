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
  onBookmarkPress?: (eventId?: string) => void;
};

export function EventCard({ event, onPress, hideBookmark = false, onBookmarkPress }: Props) {
  const [imageError, setImageError] = useState(false);

  const renderPricePoints = (pricePoint: number | undefined) => {
    // Keep same visual semantics as web: "$$", etc.
    return Array.from({ length: Math.max(0, pricePoint || 0) }, () => "$").join("");
  };

  const formatDate = () => {
    if (!event.startDate) return "";
    if (event.endDate) {
      return `${event.startDate} - ${event.endDate}`;
    }
    return event.startDate;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={`Open ${event.name} details`}
    >
      <View style={styles.imageWrap}>
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
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{formatDate()}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.meta}>
        <View style={styles.left}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {event.name}
          </Text>

          <View style={styles.row}>
            <Text style={styles.price}>{renderPricePoints(event.pricePoint)}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.category} numberOfLines={1}>
              {event.category}
            </Text>
          </View>

          <Text style={styles.city} numberOfLines={1}>
            {event.city}
          </Text>
        </View>

        <View style={styles.right}>
          {!hideBookmark && (
            <TouchableOpacity
              onPress={() => onBookmarkPress?.(event.id)}
              style={styles.bookmarkBtn}
              accessibilityRole={"button"}
              accessibilityLabel={`Bookmark ${event.name}`}
            >
              <Bookmark size={16} color="#4B5563" />
            </TouchableOpacity>
          )}

          <View style={styles.ratingRow}>
            <Star size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{event.rating}</Text>
          </View>

          <View style={styles.distanceWrap}>
            <Text style={styles.distanceText}>{event.distance} mi</Text>
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
  cardPressed: {
    opacity: 0.9,
  },

  imageWrap: {
    height: 120,
    backgroundColor: "#E5E7EB",
    width: "100%",
    position: "relative",
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
  dateBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  meta: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  price: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
    marginRight: 6,
  },
  dot: {
    fontSize: 11,
    color: "#9CA3AF",
    marginRight: 6,
  },
  category: {
    fontSize: 11,
    color: "#6B7280",
    flexShrink: 1,
  },

  city: {
    fontSize: 10,
    color: "#6B7280",
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

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "700",
    marginLeft: 4,
  },

  distanceWrap: {
    height: 14,
    justifyContent: "center",
  },
  distanceText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
});