const JUDGE0_API_URL = "http://localhost:2358";

const LANGUAGE_MAP = {
    java: 62,
    python: 71,
    javascript: 63,
    typescript: 74,
    c: 50,
    cpp: 54,
    csharp: 51,
    go: 60,
    rust: 73,
};

async function executeCode(code, language, input) {
    const languageId = LANGUAGE_MAP[language];

    if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const startTime = Date.now();

    try {
        const submitResponse = await fetch(
            `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: languageId,
                    stdin: input || "",
                    cpu_time_limit: 5,
                    wall_time_limit: 10,
                    memory_limit: 128000,
                }),
            }
        );

        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error("Judge0 API error:", submitResponse.status, errorText);
            throw new Error(`Judge0 service error: ${submitResponse.status}`);
        }

        const result = await submitResponse.json();
        const executionTime = Date.now() - startTime;

        return formatResult(result, executionTime);
    } catch (error) {
        console.error("Code execution error details:", error);
        throw new Error("Failed to execute code. Judge0 service unavailable.");
    }
}

function formatResult(judge0Result, executionTime) {
    const { stdout, stderr, compile_output, status, message } = judge0Result;

    const output = stdout || "";
    const statusId = status?.id || null;
    const statusDescription = status?.description || "";

    // 3 = Accepted
    if (statusId === 3) {
        return {
            output,
            error: null,
            executionTime,
        };
    }

    // 6 = Compilation Error
    if (statusId === 6) {
        return {
            output,
            error: compile_output || stderr || statusDescription || message || "Compilation error.",
            executionTime,
        };
    }

    // 5 = Time Limit Exceeded
    if (statusId === 5) {
        return {
            output,
            error: "Execution exceeded the 5 second time limit.",
            executionTime,
        };
    }

    // 7-12 = Runtime / execution errors
    if (statusId >= 7 && statusId <= 12) {
        return {
            output,
            error: stderr || compile_output || statusDescription || message || "Runtime error.",
            executionTime,
        };
    }

    // Fallback
    return {
        output,
        error: stderr || compile_output || statusDescription || message || "Execution failed.",
        executionTime,
    };
}

module.exports = { executeCode };