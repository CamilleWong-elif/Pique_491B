import { NavigationBar } from '@/components/NavigationBar';
import { Pencil, Plus, Ticket, Upload, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/firebase';

interface CreateEventPageProps {
  onNavigate: (page: string, eventId?: string, options?: { showPrice?: boolean }) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  onEventCreated?: () => void;
}

interface TicketTier {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

const availableCategories = [
  'Music', 'Art', 'Sports', 'Outdoor', 'Fitness', 'Nightlife',
  'Workshop', 'Entertainment', 'Gaming', 'Social', 'Wellness',
  'Adventure', 'Culture', 'Educational', 'Creative', 'Theater',
  'Dance', 'Comedy', 'Food & Drink', 'Tech',
];

const ageRangeOptions = ['Any', 'Under 18', '18+', '21+'];

export function CreateEventPage({ onNavigate, onOpenMessages, unreadMessageCount, onEventCreated }: CreateEventPageProps) {
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [ageRange, setAgeRange] = useState('Any');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    { id: '1', name: 'General Admission', price: '', quantity: '' },
  ]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketTier | null>(null);
  const insets = useSafeAreaInsets();

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const addTicketTier = () => {
    const newId = (ticketTiers.length + 1).toString();
    setTicketTiers([...ticketTiers, { id: newId, name: `Tier ${newId}`, price: '', quantity: '' }]);
  };

  const updateTicketTier = (id: string, field: 'name' | 'price' | 'quantity', value: string) => {
    setTicketTiers(ticketTiers.map(tier => tier.id === id ? { ...tier, [field]: value } : tier));
    if (editingTicket && editingTicket.id === id) {
      setEditingTicket({ ...editingTicket, [field]: value });
    }
  };

  const deleteTicketTier = (id: string) => {
    setTicketTiers(ticketTiers.filter(tier => tier.id !== id));
  };

  const startEditingTicket = (ticket: TicketTier) => {
    setEditingTicket({ ...ticket });
    setShowTicketModal(true);
  };

  const saveEditedTicket = () => {
    if (editingTicket) {
      setTicketTiers(ticketTiers.map(tier => tier.id === editingTicket.id ? { ...editingTicket } : tier));
      setEditingTicket(null);
      setShowTicketModal(false);
    }
  };

  const handlePostEvent = async () => {
    try {
      if (!eventName.trim()) {
        Alert.alert('Missing info', 'Event name is required.');
        return;
      }
      if (!date.trim()) {
        Alert.alert('Missing info', 'Date is required.');
        return;
      }
      if (!location.trim()) {
        Alert.alert('Missing info', 'Location is required.');
        return;
      }
      if (!description.trim()) {
        Alert.alert('Missing info', 'Description is required.');
        return;
      }
      if (!ageRangeOptions.includes(ageRange)) {
        Alert.alert('Invalid age range', 'Please select a valid age range.');
        return;
      }
      const capacityNum = maxCapacity.trim() === '' ? null : Number(maxCapacity);
      if (capacityNum !== null && (!Number.isInteger(capacityNum) || capacityNum <= 0)) {
        Alert.alert('Invalid capacity', 'Max attendees must be a positive integer.');
        return;
      }

      await addDoc(collection(db, "events"),{
        name: eventName,
        description,
        location,
        date: date,
        maxCapacity: capacityNum,
        ageRange: ageRange,
        categories: selectedCategories,
        ticketTiers,
        createdBy: auth.currentUser?.uid,
        createdAt: new Date()
        
      });
      if (onEventCreated) onEventCreated();
      onNavigate('home');
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <X size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <TouchableOpacity onPress={handlePostEvent}>
          <Text style={styles.postButton}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Image Upload Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Event Photos</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Upload size={28} color="#9ca3af" />
            <Text style={styles.uploadText}>Add Photos</Text>
          </TouchableOpacity>
        </View>

        {/* Event Name + Age Range */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>Event Name</Text>
            <TouchableOpacity style={styles.ageButton} onPress={() => setShowAgeModal(true)}>
              <Text style={styles.ageButtonText}>For: {ageRange}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="Enter event name..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Date + Max Capacity */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 2, marginRight: 8 }]}>
            <Text style={styles.sectionLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionLabel}>Max Attendees</Text>
            <TextInput
              style={[styles.input, { textAlign: 'center' }]}
              value={maxCapacity}
              onChangeText={(v) => { if (v === '' || /^[0-9]*$/.test(v)) setMaxCapacity(v); }}
              placeholder="∞"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={(v) => { if (v.length <= 500) setDescription(v); }}
            placeholder="Describe your event..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter venue or address..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categories ({selectedCategories.length}/3)</Text>
          {selectedCategories.length > 0 && (
            <View style={styles.tagRow}>
              {selectedCategories.map(cat => (
                <View key={cat} style={styles.tag}>
                  <Text style={styles.tagText}>{cat}</Text>
                  <TouchableOpacity onPress={() => toggleCategory(cat)}>
                    <X size={12} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={[styles.dashedButton, selectedCategories.length >= 3 && styles.dashedButtonDisabled]}
            onPress={() => { if (selectedCategories.length < 3) setShowCategoryModal(true); }}
            disabled={selectedCategories.length >= 3}
          >
            <Text style={[styles.dashedButtonText, selectedCategories.length >= 3 && styles.dashedButtonTextDisabled]}>
              {selectedCategories.length >= 3 ? '✓ Maximum categories selected' : '+ Add Categories'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ticket Tiers */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>Ticket Tiers ({ticketTiers.length})</Text>
            <TouchableOpacity style={styles.addTierButton} onPress={addTicketTier}>
              <Plus size={14} color="#2C2C2C" />
              <Text style={styles.addTierText}>Add Tier</Text>
            </TouchableOpacity>
          </View>
          {ticketTiers.map(tier => (
            <View key={tier.id} style={styles.tierRow}>
              <Ticket size={16} color="#9ca3af" />
              <View style={styles.tierInfo}>
                <Text style={styles.tierName}>{tier.name || 'Untitled Tier'}</Text>
                <Text style={styles.tierDetails}>
                  ${tier.price || '0'} • {tier.quantity ? `${tier.quantity} tickets` : 'Unlimited'}
                </Text>
              </View>
              <View style={styles.tierActions}>
                <TouchableOpacity style={styles.tierActionBtn} onPress={() => startEditingTicket(tier)}>
                  <Pencil size={16} color="#6b7280" />
                </TouchableOpacity>
                {ticketTiers.length > 1 && (
                  <TouchableOpacity style={styles.tierActionBtn} onPress={() => deleteTicketTier(tier.id)}>
                    <X size={16} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      <NavigationBar
        currentPage="create"
        onNavigate={(page) => onNavigate(page)}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Age Range Modal */}
      <Modal visible={showAgeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowAgeModal(false)}>
          <View style={styles.pickerModal}>
            <Text style={styles.modalTitle}>Age Range</Text>
            {ageRangeOptions.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.pickerOption, ageRange === opt && styles.pickerOptionSelected]}
                onPress={() => { setAgeRange(opt); setShowAgeModal(false); }}
              >
                <Text style={[styles.pickerOptionText, ageRange === opt && styles.pickerOptionTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Categories</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Selected: {selectedCategories.length}/3
              {selectedCategories.length === 3 ? '  (Maximum reached)' : ''}
            </Text>
            <ScrollView contentContainerStyle={styles.categoryGrid}>
              {availableCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                const isDisabled = !isSelected && selectedCategories.length >= 3;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                      isDisabled && styles.categoryChipDisabled,
                    ]}
                    onPress={() => toggleCategory(cat)}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                      isDisabled && styles.categoryChipTextDisabled,
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.modalDoneButton} onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Ticket Edit Modal */}
      <Modal visible={showTicketModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Ticket Tier</Text>
              <TouchableOpacity onPress={() => setShowTicketModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editingTicket?.name || ''}
              onChangeText={(v) => editingTicket && setEditingTicket({ ...editingTicket, name: v })}
              placeholder="Enter ticket name..."
              placeholderTextColor="#9ca3af"
            />
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Price ($)</Text>
            <TextInput
              style={styles.input}
              value={editingTicket?.price || ''}
              onChangeText={(v) => editingTicket && setEditingTicket({ ...editingTicket, price: v })}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={editingTicket?.quantity || ''}
              onChangeText={(v) => editingTicket && setEditingTicket({ ...editingTicket, quantity: v })}
              placeholder="Unlimited"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.modalDoneButton} onPress={saveEditedTicket}>
              <Text style={styles.modalDoneText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#2C2C2C',
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  postButton: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  section: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 100,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 11,
    color: '#9ca3af',
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  ageButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ffffff',
  },
  ageButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  dashedButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dashedButtonDisabled: {
    borderColor: '#e5e7eb',
  },
  dashedButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  dashedButtonTextDisabled: {
    color: '#9ca3af',
  },
  addTierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  addTierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  tierDetails: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  tierActions: {
    flexDirection: 'row',
    gap: 4,
  },
  tierActionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#2C2C2C',
  },
  categoryChipDisabled: {
    opacity: 0.4,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  categoryChipTextDisabled: {
    color: '#9ca3af',
  },
  modalDoneButton: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalDoneText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: 220,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  pickerOptionSelected: {
    backgroundColor: '#2C2C2C',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
  },
});
