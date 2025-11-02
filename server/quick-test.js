import fetch from 'node-fetch';

async function testAPI() {
    const apiKey = 'AIzaSyCG0ePJM6-MqxblV3HFyDVnbmG-c35O04Q';
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }]
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API KEY WORKS!');
            console.log('Response:', data.candidates[0].content.parts[0].text);
        } else {
            console.log('❌ API Error:', data.error.message);
        }
    } catch (error) {
        console.log('❌ Network Error:', error.message);
    }
}

testAPI();