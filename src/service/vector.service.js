// Import the Pinecone library
const { Pinecone } =  require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: 'pcsk_MCqBD_GVQqNQzMdgySyYUiBdD1BzY3J5yZ8uSBtSHU6xVK8WrkHMfzFbffJLQUywr67P3' });

// Create a dense index with integrated embedding
const cohortChatGptIndex = pc.Index('cohort-chat-gpt');

async function createMemory({vectors, metadata, messageId}) {
    
    await cohortChatGptIndex.upsert([{
        id: messageId,
        values: vectors,
        metadata
    }])
}

    async function queryMemory({queryVector, limit = 5, metadata}) {
        const data = await cohortChatGptIndex.query({
            vector: queryVector,
            topK: limit,
            filter: metadata ? metadata : undefined,
            includeMetadata: true
        })

        return data.matches
    }

module.exports ={ createMemory, queryMemory}