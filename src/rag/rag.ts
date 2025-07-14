import express from 'express';
import cors from 'cors';
import ollama from 'ollama';
import * as lancedb from '@lancedb/lancedb';
import {Table} from "@lancedb/lancedb";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const chatHistories: Record<string, { role: 'user' | 'assistant', content: string }[]> = {};

const knowledgeBase = [
    {
        id: 'doc1',
        text: 'RAG stands for Retrieval-Augmented Generation. It combines retrieval models and generative models for grounded answers.'
    },
    {
        id: 'doc2',
        text: 'In RAG, documents are embedded into vectors and retrieved by similarity before passing to an LLM.'
    },
    {
        id: 'doc3',
        text: 'RAG is useful for chatbots needing up-to-date or domain-specific knowledge.'
    }
];

function dummyEmbed(text: string): number[] {
    return text.toLowerCase().split(' ').map(w => w.charCodeAt(0) / 255).slice(0, 10);
}


const kbEmbeddings = knowledgeBase.map((doc) => ({
    id: doc.id,
    values: dummyEmbed(doc.text),
    metadata: {
        text: doc.text
    }
}));

const initlancedb = async () => {
    const db = await lancedb.connect("data");
    console.log(kbEmbeddings);
    const entries = kbEmbeddings.map(embedding => {
        return {
            vector: embedding.values,
            id: embedding.id,
            text: embedding.metadata.text,
        }
    })
    await db.dropAllTables();
    return await db.createTable('kb',entries);
}

const retrieveRelevantDocs = async (query: string, table: Table) => {
    const queryVec = dummyEmbed(query);
    console.log(queryVec);
    return await table.search(queryVec).select(['text']).toArray();
}

app.post('/chat', async (req, res) => {
    const { prompt, session='trial', model = 'llama2' } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!chatHistories[session]) {
        chatHistories[session] = [];
    }

    // Add user's message to history
    chatHistories[session].push({ role: 'user', content: prompt });
    try {
        const table = await initlancedb();
        const contextChunks = await retrieveRelevantDocs(prompt, table);

        const systemPrompt = `Answer based only on the following context:\n${contextChunks.join("\n")}\n\n`;

        const response = await ollama.chat({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                ...chatHistories[session]
            ]
        });
        const assistantReply = response.message.content;

        // Add assistant's reply to history
        chatHistories[session].push({ role: 'assistant', content: assistantReply });

        res.json({ response: assistantReply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get response from Ollama' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});