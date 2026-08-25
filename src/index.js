export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Real AI endpoint
    if (url.pathname === "/api/generate" && request.method === "POST") {
      try {
        const body = await request.json();
        const prompt = String(body.prompt || "").trim();

        if (!prompt) {
          return Response.json(
            { error: "Prompt is required" },
            { status: 400 }
          );
        }

        if (!env.OPENAI_API_KEY) {
          return Response.json(
            { error: "OPENAI_API_KEY is not configured" },
            { status: 500 }
          );
        }

        const response = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-5.6",
              instructions:
                "You are StartupAI, an expert startup advisor. Give practical, actionable startup advice. Support English, Hindi and Hinglish.",
              input: prompt
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error:
                data.error?.message ||
                "OpenAI request failed"
            },
            { status: response.status }
          );
        }

        return Response.json({
          answer: data.output_text || "No response generated."
        });

      } catch (error) {
        return Response.json(
          { error: "Server error" },
          { status: 500 }
        );
      }
    }

    // Serve the website
    return env.ASSETS.fetch(request);
  }
};
