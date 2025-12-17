# 🧠 Memory Lane

**Memory Lane** is an intelligent AI-powered journaling application that helps you capture your thoughts and rediscover your past.  
Built with **Next.js**, **MongoDB**, and **OpenAI**, it leverages **Vector Search** and **Retrieval-Augmented Generation (RAG)** to let you **chat with your own journal entries**.


## ✨ Features

- **AI-Enhanced Journaling**  
  Write daily journal entries and let AI analyze your mood automatically — or use the built-in mood tracker.

- **Chat with Your Past**  
  Ask natural language questions like:  
  _“How did I feel about my job last year?”_  
  and get answers grounded in your actual journal history.

- **Vector Search**  
  Uses **MongoDB Atlas Vector Search** to retrieve semantically relevant memories.

- **Retrieval-Augmented Generation (RAG)**  
  Combines vector search with LLM reasoning for accurate, context-aware responses.

- **Mock AI Mode**  
  Develop and test the app **without API costs** using a built-in mock mode.


## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)  
- **Database:** MongoDB (Mongoose + Atlas Vector Search)  
- **AI:** OpenAI (GPT-4o, `text-embedding-3-small`)  
- **Styling:** Tailwind CSS  


## 🛠️ Architecture Overview

1. Journal entries are embedded using OpenAI embeddings  
2. Embeddings are stored in MongoDB Atlas Vector Search  
3. User queries are embedded and matched semantically  
4. Relevant entries are retrieved  
5. GPT-4o generates responses using RAG


## 📌 Use Cases

- Personal reflection and mental wellness tracking  
- Long-term memory recall through natural language  
- AI-powered journaling research and experimentation  

