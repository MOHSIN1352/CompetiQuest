// Alternative quiz generation without Gemini (for now)
export const generateQuizFallback = async (req, res) => {
    try {
        const { topic, numberOfQuestions, level } = req.body;
        
        // Sample questions for testing
        const sampleQuestions = [
            {
                id: 1,
                description: `What is a key concept in ${topic}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctOption: 0
            },
            {
                id: 2,
                description: `Which of the following is true about ${topic}?`,
                options: ["Statement 1", "Statement 2", "Statement 3", "Statement 4"],
                correctOption: 1
            },
            {
                id: 3,
                description: `In ${topic}, what does this mean?`,
                options: ["Definition A", "Definition B", "Definition C", "Definition D"],
                correctOption: 2
            }
        ];
        
        const questions = sampleQuestions.slice(0, numberOfQuestions);
        
        res.status(200).json({
            success: true,
            questions: questions,
            message: `Generated ${questions.length} ${level} level questions about ${topic}`
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error generating quiz', 
            error: error.message 
        });
    }
};