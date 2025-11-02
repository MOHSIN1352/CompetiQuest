import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log('Checking available models...');
        
        // Try to list models
        const models = await genAI.listModels();
        console.log('Available models:');
        models.forEach(model => {
            console.log(`- ${model.name}`);
        });
        
    } catch (error) {
        console.error('❌ Error listing models:', error.message);
        
        // Try with basic model names
        const modelNames = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'text-bison-001'
        ];
        
        for (const modelName of modelNames) {
            try {
                console.log(`\nTrying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                console.log(`✅ ${modelName} works!`);
                break;
            } catch (err) {
                console.log(`❌ ${modelName} failed: ${err.message}`);
            }
        }
    }
}

listModels();