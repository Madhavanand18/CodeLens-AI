require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

// Verify that the required environment variable is present before continuing
if (!process.env.OPENROUTER_API_KEY) {
    console.error(
        "❌ Missing OPENROUTER_API_KEY. Please set it in your .env file before starting the server."
    );
}

// Enable CORS so the React frontend (http://localhost:5173) can call this API
app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

// Middleware: required to parse incoming JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CodeLens AI Backend is running 🚀");
});

/**
 * Builds the prompt sent to the AI model, instructing it to return
 * a strict JSON object matching the expected analysis shape.
 */
function buildAnalysisPrompt(code, language) {
    return `You are a senior software engineer and code reviewer performing a professional static code analysis.

Your task is to analyze the given ${language} code and respond with STRICT JSON only, matching exactly this shape:

{
  "explanation": "A clear, beginner-friendly explanation of what the code does.",
  "bugs": ["list of logical bugs and possible runtime issues found, as strings"],
  "optimizations": ["list of optimization suggestions, as strings"],
  "complexity": "estimated time complexity and space complexity, as a string",
  "testCases": ["at least 5 meaningful test cases, as strings"]
}

Instructions:
- Explain the code in simple, beginner-friendly language.
- Detect logical bugs in the code.
- Detect possible runtime issues (e.g. null references, index out of bounds, type errors, infinite loops).
- Suggest meaningful optimizations for performance or readability.
- Estimate the time complexity of the code.
- Estimate the space complexity of the code.
- Generate at least 5 meaningful test cases, including edge cases.
- If there are no bugs or optimizations to report, return an empty array for that field.
- Never return markdown.
- Never return code fences.
- Never include any text outside the JSON object.
- Return ONLY valid JSON.

Code:
\`\`\`${language}
${code}
\`\`\`
`;
}

/**
 * POST /analyze
 * Accepts source code and a language, sends it to OpenRouter for analysis,
 * and returns the parsed AI-generated analysis.
 */
app.post("/analyze", async (req, res) => {
    try {
        const { code, language } = req.body;

        // Validation: both code and language must be present and non-empty
        if (
            !code ||
            typeof code !== "string" ||
            code.trim() === "" ||
            !language ||
            typeof language !== "string" ||
            language.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Code and language are required.",
            });
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Server is missing required API configuration.",
            });
        }

        // Call the OpenRouter API for code analysis
        const openRouterResponse = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat-v3.1",
                    messages: [
                        {
                            role: "user",
                            content: buildAnalysisPrompt(code, language),
                        },
                    ],
                }),
            }
        );

        if (!openRouterResponse.ok) {
            console.error(
                "OpenRouter API error:",
                openRouterResponse.status,
                await openRouterResponse.text()
            );
            return res.status(500).json({
                success: false,
                message: "Failed to reach the AI analysis service.",
            });
        }

        const openRouterData = await openRouterResponse.json();
        const rawContent = openRouterData?.choices?.[0]?.message?.content;

        if (!rawContent) {
            console.error("OpenRouter response missing content:", openRouterData);
            return res.status(500).json({
                success: false,
                message: "AI service returned an empty response.",
            });
        }

        // Attempt to parse the AI's response as JSON.
        // Strip any accidental markdown code fences before parsing.
        const cleanedContent = rawContent
            .trim()
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

        let analysis;
        try {
            analysis = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", rawContent);
            return res.status(500).json({
                success: false,
                message: "AI returned an invalid response format.",
            });
        }

        // Ensure the parsed object matches the expected shape,
        // falling back to safe defaults for any missing fields.
        const safeAnalysis = {
            explanation:
                typeof analysis.explanation === "string" ? analysis.explanation : "",
            bugs: Array.isArray(analysis.bugs) ? analysis.bugs : [],
            optimizations: Array.isArray(analysis.optimizations)
                ? analysis.optimizations
                : [],
            complexity:
                typeof analysis.complexity === "string" ? analysis.complexity : "N/A",
            testCases: Array.isArray(analysis.testCases) ? analysis.testCases : [],
        };

        return res.status(200).json({
            success: true,
            analysis: safeAnalysis,
        });
    } catch (error) {
        // Catch-all for unexpected runtime errors
        console.error("POST /analyze error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while processing the request.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});