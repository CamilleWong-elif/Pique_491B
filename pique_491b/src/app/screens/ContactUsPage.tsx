import React, { useMemo, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { ArrowLeft, Mail, User, MessageSquare, Send } from 'lucide-react-native';
import { apiSendContactMessage } from '@/api';

type Props = {
    onNavigate?: (page: string) => void;
};

type ContactForm = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: ContactForm = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

function validateForm(form: ContactForm): string | null {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!form.email.trim()) return 'Please enter your email.';
    if (!EMAIL_RE.test(form.email.trim())) return 'Please enter a valid email address.';
    if (!form.subject.trim()) return 'Please enter a subject.';
    if (!form.message.trim()) return 'Please enter a message.';
    if (form.message.trim().length < 10) return 'Your message is too short.';
    return null;
}

export default function ContactUsPage({ onNavigate }: Props) {
    const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
    const [isSending, setIsSending] = useState(false);
    const topPad = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

    const messageLength = useMemo(() => form.message.trim().length, [form.message]);

    const setField = (field: keyof ContactForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSend = async () => {
        if (isSending) return;

        const error = validateForm(form);
        if (error) {
            Alert.alert('Missing info', error);
            return;
        }

        try {
            setIsSending(true);
            await apiSendContactMessage({
                name: form.name.trim(),
                email: form.email.trim(),
                subject: form.subject.trim(),
                message: form.message.trim(),
            });

            setForm(INITIAL_FORM);
            Alert.alert('Message sent', 'Thanks for contacting us. We will get back to you soon.');
        } catch (err: any) {
            Alert.alert('Send failed', err?.message || 'We could not send your message right now.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.root}>
            <View style={[styles.header, { paddingTop: 12 + topPad }]}> 
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => onNavigate?.('home')}
                        style={styles.backBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                    >
                        <ArrowLeft size={20} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.title}>Contact Us</Text>
                        <Text style={styles.subtitle}>Questions, bugs, or feedback, send us a note.</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.fieldWrap}>
                        <View style={styles.labelRow}>
                            <User size={16} color="#6B7280" />
                            <Text style={styles.label}>Name</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Your name"
                            value={form.name}
                            onChangeText={(v) => setField('name', v)}
                            placeholderTextColor="#9CA3AF"
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.fieldWrap}>
                        <View style={styles.labelRow}>
                            <Mail size={16} color="#6B7280" />
                            <Text style={styles.label}>Email</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            value={form.email}
                            onChangeText={(v) => setField('email', v)}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.fieldWrap}>
                        <View style={styles.labelRow}>
                            <MessageSquare size={16} color="#6B7280" />
                            <Text style={styles.label}>Subject</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="How can we help?"
                            value={form.subject}
                            onChangeText={(v) => setField('subject', v)}
                            placeholderTextColor="#9CA3AF"
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.fieldWrap}>
                        <View style={styles.messageHeaderRow}>
                            <View style={styles.labelRow}>
                                <Send size={16} color="#6B7280" />
                                <Text style={styles.label}>Message</Text>
                            </View>
                            <Text style={styles.counter}>{messageLength}/5000</Text>
                        </View>
                        <TextInput
                            style={styles.message}
                            placeholder="Tell us what happened and what you expected..."
                            value={form.message}
                            onChangeText={(v) => setField('message', v)}
                            multiline
                            numberOfLines={8}
                            placeholderTextColor="#9CA3AF"
                            textAlignVertical="top"
                            maxLength={5000}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={isSending}
                    >
                        <Text style={styles.sendButtonText}>{isSending ? 'Sending...' : 'Send Message'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    root: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingHorizontal: 18,
        paddingBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTextWrap: {
        flex: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
    },
    subtitle: {
        marginTop: 2,
        fontSize: 12,
        color: '#6B7280',
    },
    container: {
        padding: 18,
        paddingBottom: 28,
    },
    fieldWrap: {
        marginBottom: 14,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    messageHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
    },
    counter: {
        fontSize: 12,
        color: '#6B7280',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 11,
        fontSize: 16,
        color: '#111827',
    },
    message: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 11,
        minHeight: 170,
        fontSize: 16,
        color: '#111827',
    },
    sendButton: {
        marginTop: 6,
        backgroundColor: '#0EA5E9',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.65,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});