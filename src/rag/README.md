# Retrieval Augmented Generation

## Requirements 
1. Lance DB to run an in-memory vector DB
2. Some dummy embedding function to convert text into vectors

## Steps 
1. Run the code
    ```
    npm run dev:rag
    ```
2. Make a post call to http://localhost:3000/chat with payload
     ```json
    { 
       "prompt": "What in the world is RAG? Seven Eight Nine Ten"
     }
    ```

## Interesting Observation
The number of tokens(strings) in my prompt had to match exactly to the dimensions in my vector database. I assume this is because of my dummy embedding function. Will experiment with a proper text embedding model next. 