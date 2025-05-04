# GitHub Repository RAG Assistant

A full-stack application that uses Retrieval-Augmented Generation (RAG) to analyze GitHub repositories and answer questions about their code.

## Features

- Index any public GitHub repository
- Process and chunk code files respecting function/class boundaries
- Generate embeddings for code chunks and store them in a vector database
- Ask natural language questions about the repository
- Get AI-generated answers based on the relevant code contexts

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, React Query
- **Backend**: Python, FastAPI
- **Vector Database**: Qdrant (in-memory for development)
- **Embedding Model**: OpenAI Text Embedding API
- **LLM**: OpenAI GPT-3.5 Turbo

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.9+
- OpenAI API key

### Installation

1. Clone this repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the backend directory:
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   uvicorn main:app --reload
   ```

2. In another terminal, start the frontend:
   ```
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Usage

1. Enter a GitHub repository URL in the input field
2. Click "Process Repository" to start indexing
3. Wait for the indexing to complete (this may take some time for large repositories)
4. Ask questions about the repository in the chat interface
5. View AI-generated answers with references to specific code files

## Limitations

- The in-memory vector database does not persist data between server restarts
- Large repositories may take a significant amount of time to process
- The chunking algorithm may not perfectly respect code boundaries in all languages
- The quality of answers depends on the OpenAI model used

## Future Improvements

- Persistent vector database storage
- Support for private GitHub repositories
- More sophisticated code parsing and chunking
- Multi-user support with authentication
- Caching of previously processed repositories

## License

MIT