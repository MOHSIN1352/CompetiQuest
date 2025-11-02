import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testQuizGeneration() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `Generate 3 multiple choice questions about JavaScript at medium difficulty level. 
        Return ONLY a valid JSON array with this exact format:
        [
          {
            "id": 1,
            "description": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctOption": 0
          }
        ]
        Make sure correctOption is the index (0-3) of the correct answer in the options array.`;
        
        console.log('Generating quiz...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Raw response:', text);
        
        let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const questions = JSON.parse(cleanedText);
        
        console.log('✅ Quiz generated successfully!');
        console.log('Questions:', JSON.stringify(questions, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testQuizGeneration();