# Prompt Engineering
I wanted to play around with prompt engineering. 
I tried instructing the LLM to only answer in one sentence, use an Emoji in every response and include the words 'You are awesome' in every response. It did quite well.

1. Run the code
    ```
    npm run dev:prompt
    ```
2. Make a post call to http://localhost:3000/chat with payload
     ```json
    { 
       "prompt": "Ask anything",
       "session": "Session name to use LLM with memory"
     }
    ```
