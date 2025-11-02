import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testQuizGeneration() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
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
        
        console.log('Sending request to Gemini AI...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Raw response:', text);
        
        // Clean the response
        let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const questions = JSON.parse(cleanedText);
        
        console.log('Parsed questions:', JSON.stringify(questions, null, 2));
        console.log('✅ Quiz generation working!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testQuizGeneration();