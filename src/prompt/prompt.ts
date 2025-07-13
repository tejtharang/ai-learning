import express from 'express';
import cors from 'cors';
import ollama, {Message} from 'ollama';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const chatHistories: Record<string, Message[]> = {};
const callOllama = async (model: string, chatHistory: Record<string, Message[]>, session: string) => {
    const response = await ollama.chat({
        model,
        messages: chatHistory[session]
    });
   return response.message.content;
}

app.post('/chat', async (req, res) => {
    const { prompt, session='trial', model = 'llama2' } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!chatHistories[session]) {
        chatHistories[session] = [];
        const baselinePrompt: string = "Answer every question with 'You're Awesome'"
        const message: Message = {
            role: 'system',
            content: baselinePrompt
        };
        chatHistories[session].push(message);
        const reply = await callOllama(model, chatHistories, session);
        const replyMessage = {
            role: 'assistant',
            content: reply
        }
        chatHistories[session].push(replyMessage);
    }

    // Add user's message to history
    chatHistories[session].push({ role: 'user', content: prompt });
    try {
        const response = await ollama.chat({
            model,
            messages: chatHistories[session]
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