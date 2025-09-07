const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({apiKey: "AIzaSyDAxiqY-hQ9EwTrvRRTUqBFTLzbaj0oRiY"})

async function generateResponse(messages) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents:  messages,
    });

    return response.text;
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