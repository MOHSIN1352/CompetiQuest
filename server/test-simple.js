import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

async function testGeminiDirect() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('Testing API key:', apiKey.substring(0, 10) + '...');
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Generate 2 JavaScript questions with 4 options each in JSON format'
                    }]
                }]
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API working!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ API Error:', data);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testGeminiDirect();