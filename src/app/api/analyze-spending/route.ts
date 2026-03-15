import { analyzeSpending } from "@/lib/ai/geminiClient";

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "AI coach disabled until Gemini API key is configured." }, { status: 503 });
    }

    const body = await req.json();
    const { income, expenses } = body;

    const prompt = `
You are a financial advisor for young adults.

Analyze this user's spending.

Income: ${income}

Expenses:
${JSON.stringify(expenses)}

Return:

1. Spending analysis
2. Overspending warnings
3. Practical saving suggestions
4. Potential yearly savings
    `;

    const result = await analyzeSpending(prompt);

    return Response.json({ advice: result });
  } catch (error) {
    console.error("Error analyzing spending:", error);
    return Response.json({ error: "Failed to analyze spending." }, { status: 500 });
  }
}
