import { ALL_CATEGORIES } from '@/constants/categories';
import { US_LOCATIONS, LANGUAGES } from '@/constants/surveyOptions';
import { apiSubmitSurvey } from '@/api';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SurveyScreenProps {
  onComplete: () => void;
}

const STEPS = ['identity', 'location', 'interests'] as const;

export function SurveyScreen({ onComplete }: SurveyScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<string>('');
  const [location, setLocation] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [langQuery, setLangQuery] = useState('');
  const [showLangSuggestions, setShowLangSuggestions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const filteredLocations = locationQuery.length > 0
    ? US_LOCATIONS.filter((l) => l.toLowerCase().includes(locationQuery.toLowerCase())).slice(0, 6)
    : [];

  const filteredLanguages = langQuery.length > 0
    ? LANGUAGES.filter((l) => l.toLowerCase().includes(langQuery.toLowerCase()) && !selectedLanguages.includes(l)).slice(0, 6)
    : [];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const canGoNext = () => {
    if (step === 0) return gender.length > 0;
    if (step === 1) return true;
    if (step === 2) return selectedCategories.length > 0;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await apiSubmitSurvey({
        gender,
        location,
        languages: selectedLanguages,
        preferredCategories: selectedCategories,
      });
      onComplete();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Text style={styles.title}>How do you identify?</Text>
            <Text style={styles.subtitle}>This information will always be private.</Text>
            <View style={styles.optionRow}>
              {['Female', 'Male', 'Other'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pill, gender === opt.toLowerCase() && styles.pillActive]}
                  onPress={() => setGender(opt.toLowerCase())}
                >
                  <Text style={[styles.pillText, gender === opt.toLowerCase() && styles.pillTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>Where do you live?</Text>
            <TextInput
              style={styles.input}
              value={location || locationQuery}
              onChangeText={(text) => {
                setLocation('');
                setLocationQuery(text);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => {
                if (location) {
                  setLocationQuery(location);
                  setLocation('');
                }
                setShowLocationSuggestions(true);
              }}
              placeholder="Start typing a city..."
              placeholderTextColor="#9ca3af"
            />
            {showLocationSuggestions && filteredLocations.length > 0 && (
              <View style={styles.suggestionsBox}>
                {filteredLocations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setLocation(loc);
                      setLocationQuery('');
                      setShowLocationSuggestions(false);
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={styles.suggestionText}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.title, { marginTop: 28 }]}>What languages do you speak?</Text>
            {selectedLanguages.length > 0 && (
              <View style={styles.selectedChipsRow}>
                {selectedLanguages.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={styles.selectedChip}
                    onPress={() => setSelectedLanguages((prev) => prev.filter((l) => l !== lang))}
                  >
                    <Text style={styles.selectedChipText}>{lang}  x</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput
              style={styles.input}
              value={langQuery}
              onChangeText={(text) => {
                setLangQuery(text);
                setShowLangSuggestions(true);
              }}
              onFocus={() => setShowLangSuggestions(true)}
              placeholder="Start typing a language..."
              placeholderTextColor="#9ca3af"
            />
            {showLangSuggestions && filteredLanguages.length > 0 && (
              <View style={styles.suggestionsBox}>
                {filteredLanguages.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setSelectedLanguages((prev) => [...prev, lang]);
                      setLangQuery('');
                      setShowLangSuggestions(false);
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={styles.suggestionText}>{lang}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Which events interest you?</Text>
            <Text style={styles.subtitle}>Select all that apply.</Text>
            <View style={styles.categoryGrid}>
              {ALL_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategories.includes(cat) && styles.categoryChipActive]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text
                    style={[styles.categoryChipText, selectedCategories.includes(cat) && styles.categoryChipTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.buttonRow}>
        {step > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, !canGoNext() && styles.nextButtonDisabled]}
          disabled={!canGoNext() || submitting}
          onPress={handleNext}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>{step === STEPS.length - 1 ? 'Get Started' : 'Next'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
  },
  dotActive: {
    backgroundColor: '#6366f1',
    width: 28,
  },
  dotDone: {
    backgroundColor: '#a5b4fc',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  pillText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  pillTextActive: {
    color: '#6366f1',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  suggestionsBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontSize: 15,
    color: '#111827',
  },
  selectedChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  selectedChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  selectedChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
