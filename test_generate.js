(async () => {
  try {
    const resp = await fetch('http://localhost:5000/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Photosynthesis', numberOfQuestions: 3, level: 'easy' })
    });
    const text = await resp.text();
    console.log(text);
  } catch (err) {
    console.error('Request error:', err);
  }
})();
