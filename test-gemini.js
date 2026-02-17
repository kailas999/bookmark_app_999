// Run with: node --env-file=.env.local test-gemini.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
// require('dotenv').config({ path: '.env.local' }); // Use native node --env-file instead

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is not set in .env.local');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    console.log('🔍 Fetching available Gemini models...\n');

    try {
        // Try different model names
        const modelsToTest = [
            'gemini-pro',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-2.0-flash-exp',
            'gemini-2.5-flash',
            'gemini-3-flash',
            'models/gemini-pro',
            'models/gemini-1.5-flash',
        ];

        for (const modelName of modelsToTest) {
            try {
                console.log(`Testing: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say "test"');
                const response = await result.response;
                console.log(`✅ ${modelName} - WORKS!\n`);
            } catch (error) {
                console.log(`❌ ${modelName} - ${error.message}\n`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
