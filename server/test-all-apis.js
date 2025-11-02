import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/quiz';
const userId = '6907427a3490753bf75d4674';

async function testAllAPIs() {
    console.log('🚀 Testing all Quiz APIs...\n');
    
    try {
        // Test 1: Generate Quiz
        console.log('1️⃣ Testing Generate Quiz API...');
        const generateResponse = await fetch(`${BASE_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                topic: 'JavaScript',
                numberOfQuestions: 3,
                level: 'medium'
            })
        });
        
        const generateData = await generateResponse.json();
        console.log('Generate Quiz Result:', generateData.success ? '✅ SUCCESS' : '❌ FAILED');
        
        if (!generateData.success) {
            console.log('Error:', generateData.message);
            return;
        }
        
        const quizAttemptId = generateData.quizAttemptId;
        console.log('Quiz ID:', quizAttemptId);
        console.log('Questions generated:', generateData.questions.length);
        
        // Test 2: Submit Quiz
        console.log('\n2️⃣ Testing Submit Quiz API...');
        const submitResponse = await fetch(`${BASE_URL}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizAttemptId: quizAttemptId,
                answers: [
                    { selectedOption: 0 },
                    { selectedOption: 1 },
                    { selectedOption: 2 }
                ]
            })
        });
        
        const submitData = await submitResponse.json();
        console.log('Submit Quiz Result:', submitData.success ? '✅ SUCCESS' : '❌ FAILED');
        
        if (submitData.success) {
            console.log('Score:', submitData.score + '/' + submitData.totalQuestions);
            console.log('Percentage:', submitData.percentage + '%');
        }
        
        // Test 3: Get User History
        console.log('\n3️⃣ Testing User History API...');
        const historyResponse = await fetch(`${BASE_URL}/history/${userId}`);
        const historyData = await historyResponse.json();
        
        console.log('User History Result:', historyData.success ? '✅ SUCCESS' : '❌ FAILED');
        
        if (historyData.success) {
            console.log('Total attempts:', historyData.total);
            console.log('Recent attempts:', historyData.quizAttempts.length);
        }
        
        console.log('\n🎉 ALL TESTS COMPLETED!');
        
    } catch (error) {
        console.log('❌ Network Error:', error.message);
    }
}

testAllAPIs();