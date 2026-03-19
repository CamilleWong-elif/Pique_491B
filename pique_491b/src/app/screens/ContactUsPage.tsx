import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { apiSendContactMessage } from '@/api';

type Props = {
    onNavigate?: (page: string) => void;
};

export default function ContactUsPage({ onNavigate }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

    const handleSend = async () => {
        if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
            Alert.alert('Missing info', 'Please fill in all fields.');
            return;
        }

        if (isSending) {
            return;
        }

        try {
            setIsSending(true);
            await apiSendContactMessage({
                name: name.trim(),
                email: email.trim(),
                subject: subject.trim(),
                message: message.trim(),
            });

            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
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
                        <ArrowLeft size={20} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Contact Us</Text>
                </View>
            </View>

            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contact Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.subject}
                    placeholder="Subject"
                    value={subject}
                    onChangeText={setSubject}
                    placeholderTextColor="#999"
                />

                <TextInput
                    style={styles.message}
                    placeholder="Type your message here..."
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={8}
                    placeholderTextColor="#999"
                    textAlignVertical="top"
                />

                <TouchableOpacity style={[styles.sendButton, isSending && styles.sendButtonDisabled]} onPress={handleSend} disabled={isSending}>
                    <Text style={styles.sendButtonText}>{isSending ? 'Sending...' : 'Send'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingHorizontal: 21,
        paddingBottom: 12,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
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
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    subject: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    message: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
        flexGrow: 1,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.65,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});