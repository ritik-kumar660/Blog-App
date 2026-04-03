import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";

const PROMPTS: Record<string, (content: string, extra?: string) => string> = {
  generate: (content) => `
    You are an expert AI blog editor.
    Based on the following blog content, generate:
    1. A catchy, SEO-friendly title (max 60 characters).
    2. A concise summary or excerpt (max 160 characters).
    3. A list of 3-5 relevant tags (comma separated).

    Return STRICTLY as a JSON object, no markdown blocks:
    { "title": "...", "summary": "...", "tags": "tag1, tag2, tag3" }

    Content:
    """
    ${content.replace(/<[^>]+>/g, '').substring(0, 3000)}
    """
  `,

  summarize: (content) => `
    You are an expert content summarizer.
    Read the following blog post and generate a concise, engaging summary in 2-3 sentences (max 200 words).
    Write as if describing the article to a potential reader to entice them to read it.
    Return ONLY the summary text, no JSON, no labels.

    Content:
    """
    ${content.replace(/<[^>]+>/g, '').substring(0, 4000)}
    """
  `,

  improve: (content) => `
    You are a professional writing coach and editor.
    Improve the following blog post content to make it:
    - More engaging and readable
    - Better structured with clear paragraphs
    - Written in an active, conversational tone
    - Free of grammatical errors

    Return ONLY the improved content as clean HTML (using <p>, <h2>, <strong>, <em>, <ul>, <li> tags only).
    Do NOT add a title or introductory phrase like "Here is the improved version:".

    Original content:
    """
    ${content.replace(/<[^>]+>/g, '').substring(0, 4000)}
    """
  `,

  expand: (content) => `
    You are an expert blog writer.
    The user has written the following short content. Expand it into a full, well-structured blog post.
    Add relevant details, examples, and insights to make it engaging and comprehensive (target 400-600 words).
    Return ONLY the expanded content as clean HTML (using <p>, <h2>, <strong>, <em>, <ul>, <li> tags only).
    Do NOT include any meta-commentary.

    Content to expand:
    """
    ${content.replace(/<[^>]+>/g, '').substring(0, 2000)}
    """
  `,

  draft: (_content, topic) => `
    You are an expert blog writer.
    Write a complete, engaging blog post on the following topic: "${topic}"
    
    Requirements:
    - Well-structured with an introduction, 3-4 body sections with <h2> headings, and a conclusion
    - Conversational yet informative tone
    - 400-600 words
    - Return ONLY clean HTML content (using <p>, <h2>, <strong>, <em>, <ul>, <li> tags only)
    - Do NOT include a title tag or meta-commentary
  `,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured. Missing GEMINI_API_KEY." }, { status: 503 });
    }

    const { content, mode, extra } = await req.json();

    if (!mode || !PROMPTS[mode]) {
      return NextResponse.json({ error: "Invalid AI mode." }, { status: 400 });
    }

    // For 'draft' mode we only need the topic, not full content
    if (mode !== "draft" && (!content || content.replace(/<[^>]+>/g, '').length < 20)) {
      return NextResponse.json({ error: "Content is too short for AI to work with." }, { status: 400 });
    }

    if (mode === "draft" && (!extra || extra.trim().length < 3)) {
      return NextResponse.json({ error: "Please provide a topic for the draft." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = PROMPTS[mode](content || "", extra);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    if (mode === "generate") {
      // JSON mode
      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      try {
        const aiData = JSON.parse(cleanJson);
        return NextResponse.json({ mode, ...aiData }, { status: 200 });
      } catch {
        return NextResponse.json({ error: "Failed to parse AI response.", raw: responseText }, { status: 500 });
      }
    }

    // All other modes return plain text / HTML
    return NextResponse.json({ mode, result: responseText }, { status: 200 });

  } catch (error: unknown) {
    console.error("AI Generation Error:", error);

    const status = (error as { status?: number })?.status;
    const message = (error as { message?: string })?.message;
    const statusText = (error as { statusText?: string })?.statusText;

    // Handle Gemini API rate limit / quota exceeded
    if (status === 429 || message?.includes("429") || statusText === "Too Many Requests") {
      return NextResponse.json(
        { error: "⏳ Rate limit hit. The free Gemini API has limits. Please wait a few seconds and try again." },
        { status: 429 }
      );
    }

    // Handle model not found
    if (status === 404 || statusText === "Not Found") {
      return NextResponse.json(
        { error: "AI model not available. Please check your GEMINI_API_KEY has access to Gemini models." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
