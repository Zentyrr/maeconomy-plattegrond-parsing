// App.js
import React from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, StyleSheet, ActivityIndicator
} from 'react-native';
import { useOCR } from './hooks/useOCR';

export default function App() {
    const { pickAndProcess, isLoading, result, error } = useOCR();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={pickAndProcess}
                disabled={isLoading}
            >
                {isLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Pick PDF & Run OCR</Text>
                }
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}

            {result && (
                <ScrollView style={styles.results}>
                    <Text style={styles.meta}>
                        {result.pageCount} page{result.pageCount !== 1 ? 's' : ''} extracted
                    </Text>
                    {result.pages.map(page => (
                        <View key={page.page} style={styles.page}>
                            <Text style={styles.pageLabel}>Page {page.page}</Text>
                            <Text style={styles.pageText}>{page.text || '(no text found)'}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f5f5f5' },
    button: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 10, alignItems: 'center' },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    error: { color: 'red', marginTop: 12 },
    results: { marginTop: 20 },
    meta: { color: '#666', marginBottom: 10 },
    page: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 12 },
    pageLabel: { fontWeight: '700', marginBottom: 6, color: '#4f46e5' },
    pageText: { color: '#333', lineHeight: 20 },
});