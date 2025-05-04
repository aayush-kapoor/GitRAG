import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from openai import OpenAI

# Load environment variables
load_dotenv()

LLM_MODEL = "gpt-3.5-turbo"
client = None

def initialize_llm():
    global client
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    client = OpenAI(api_key=api_key)

def generate_answer(query: str, context_chunks: List[Dict[str, Any]]) -> str:
    """
    Generate an answer using an LLM based on the query and context chunks.
    """
    if not client:
        initialize_llm()

    context_text = "\n\n".join([
        f"File: {chunk['path']}\n```\n{chunk['content']}\n```"
        for chunk in context_chunks
    ])

    system_prompt = """
        You are an expert code assistant that helps developers understand GitHub repositories.
        You'll be given code snippets from a repository and a question about them.
        Answer the question based solely on the provided code snippets.
        If you cannot answer based on the provided context, say so clearly.
        Format your answers using markdown. Include code blocks with appropriate syntax highlighting when referring to code.
        """

    user_prompt = f"""
        Question: {query}

        Here are the relevant code snippets from the repository:

        {context_text}

        Please answer the question based on these code snippets.
        Include specific references to the code when relevant, citing file paths where appropriate.
        """

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": user_prompt.strip()}
            ],
            temperature=0.2,
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating answer: {str(e)}"
