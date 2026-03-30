import { useState } from 'react';

const OCR_SERVER_URL = 'http://10.3.1.79:5000'

export const useOCR = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const pickAndProcess = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const file = await new Promise((resolve, reject) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';
                input.onchange = (e) => {
                    const f = e.target.files[0];
                    f ? resolve(f) : reject(new Error('No file selected'));
                };
                input.oncancel = () => reject(new Error('Cancelled'));
                input.click();
            });

            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const response = await fetch(`${OCR_SERVER_URL}/ocr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdf: base64 }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'OCR failed');
            }

            const data = await response.json();
            setResult(data);
            return data;

        } catch (err) {
            if (err.message !== 'Cancelled') {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { pickAndProcess, isLoading, result, error };
};