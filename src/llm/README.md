# Hosting an LLM

1. Install Ollama from https://ollama.com/download
2. Make sure that Ollama is in your classpath by checking the path variable in your environment variables.
3. Download an open source model using Ollama 
    ```
    ollama pull llama2
    ```
4. Confirm that the model is downloaded and available
    ```
   ollama list
   ```
5. Serve up the model
    ```
   ollama serve
   ```
6. Now run the code using 
    ```
   npm run dev:llm
   ```
7. Make a post call to http://localhost:3000/chat with payload
    ```json
   { 
      "prompt": "Your prompt",
      "session": "Session name to use LLM with memory"
    }
   ```
