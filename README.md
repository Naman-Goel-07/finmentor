# Finmentor AI

Finmentor AI is a complete personal finance tracker with AI-powered insights.

## How to Run Locally

Follow these steps to set up the project locally. It is designed to be beginner friendly and requires minimal setup.

### 1. Install dependencies

Run the following command to install required packages:

```bash
npm install
```

### 2. Add environment variables to .env.local

Create a `.env.local` file in the root directory (if not already present) and fill it with your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_public_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Run development server

Start the local server using:

```bash
npm run dev
```

### 4. Open in browser

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
