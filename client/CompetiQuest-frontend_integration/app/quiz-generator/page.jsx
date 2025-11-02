'use client';
import { useState } from 'react';
import axios from 'axios';

export default function QuizGenerator() {
    const [formData, setFormData] = useState({
        topic: '',
        numberOfQuestions: 5,
        level: 'medium'
    });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/quiz/generate`, formData);
            setQuestions(response.data.questions);
        } catch (error) {
            console.error('Error generating quiz:', error);
            alert('Error generating quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">AI Quiz Generator</h1>
            
            <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Topic</label>
                        <input
                            type="text"
                            value={formData.topic}
                            onChange={(e) => setFormData({...formData, topic: e.target.value})}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., JavaScript, Math, Science"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Number of Questions</label>
                        <select
                            value={formData.numberOfQuestions}
                            onChange={(e) => setFormData({...formData, numberOfQuestions: parseInt(e.target.value)})}
                            className="w-full p-2 border rounded"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                            className="w-full p-2 border rounded"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Generate Quiz'}
                </button>
            </form>

            {questions.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Generated Questions</h2>
                    {questions.map((question, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold mb-3">Q{index + 1}: {question.description}</h3>
                            <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`p-2 rounded ${
                                            optIndex === question.correctOption
                                                ? 'bg-green-100 border-green-500 border-2'
                                                : 'bg-gray-50 border'
                                        }`}
                                    >
                                        {String.fromCharCode(65 + optIndex)}. {option}
                                        {optIndex === question.correctOption && (
                                            <span className="text-green-600 font-semibold ml-2">✓ Correct</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}