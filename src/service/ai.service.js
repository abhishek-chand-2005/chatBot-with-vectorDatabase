const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({apiKey: "AIzaSyDAxiqY-hQ9EwTrvRRTUqBFTLzbaj0oRiY"})

async function generateResponse(messages) {
  try {
    const validMessages = messages
      .filter(item => item.content && item.content.trim() !== "") // ✅ keep only valid text
      .map(item => ({
        role: item.role || "user", // fallback
        parts: [{ text: item.content }]
      }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: validMessages,
    });

    return response.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("AI service error:", err);
    throw err;
  }
}


async function generateVector(content) {
  
   const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: content,
        config: {
          outputDimensionality: 768
        }
    });

    return response.embeddings[0].values

}


module.exports = {
    generateResponse,
    generateVector
}