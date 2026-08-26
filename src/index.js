export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
            { error: "OPENAI_API_KEY secret is missing" },
            { status: 500 }
          );
        }

        const openaiResponse = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-5.6",
              input: prompt
            })
          }
        );

        const text = await openaiResponse.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          return Response.json(
            {
              error: "OpenAI returned a non-JSON response",
              status: openaiResponse.status
            },
            { status: 502 }
          );
        }

        if (!openaiResponse.ok) {
          return Response.json(
            {
              error:
                data?.error?.message ||
                "OpenAI API request failed"
            },
            { status: openaiResponse.status }
          );
        }

        return Response.json({
          answer:
            data.output_text ||
            "AI response was empty."
        });

      } catch (error) {
        return Response.json(
          {
            error: error?.message || "Worker error"
          },
          { status: 500 }
        );
      }
    }

    // Website files
    return env.ASSETS.fetch(request);
  }
};
