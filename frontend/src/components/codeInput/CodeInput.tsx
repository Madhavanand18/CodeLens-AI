import LoadingOverlay from "./components/LoadingOverlay";
import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import RunCode from "../runCode/RunCode";
import type { languages } from "monaco-editor";
import "./CodeInput.css";

// Supported languages for the code input
const LANGUAGES: string[] = [
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
];

// Maps display language labels to Monaco's language identifiers
const MONACO_LANGUAGE_MAP: Record<string, string> = {
  Java: "java",
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  C: "c",
  "C++": "cpp",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
};

// Maps display language labels to backend language identifiers
const BACKEND_LANGUAGE_MAP: Record<string, string> = {
  Java: "java",
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  C: "c",
  "C++": "cpp",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
};

// Maps display language labels to a representative file extension,
// used to render a realistic filename in the toolbar
const FILE_EXTENSION_MAP: Record<string, string> = {
  Java: "main.java",
  Python: "main.py",
  JavaScript: "main.js",
  TypeScript: "main.ts",
  C: "main.c",
  "C++": "main.cpp",
  "C#": "main.cs",
  Go: "main.go",
  Rust: "main.rs",
};

// Shape of the analysis result returned by the backend
interface AnalysisResult {
  explanation: string;
  bugs: string[];
  optimizations: string[];
  complexity: string;
  testCases: string[];
}

// Props allow this component to be reused and customized across the app
interface CodeInputProps {
  /** Initial code to populate the editor with */
  onBeforeAnalyze?: (code: string, language: string) => void;
  initialCode?: string;
  /** Initial selected language */
  initialLanguage?: string;
  /** Placeholder text shown inside the editor when empty */
  placeholder?: string;
  /** Called when analysis completes successfully, with the returned analysis data */
  onAnalysisComplete?: (analysis: AnalysisResult) => void;
  /** Called when the user clicks "Clear" */
  onClear?: () => void;
  /** Called when the user clicks "Paste from Clipboard" */
  onPasteClick?: () => void;
}

// Guards against registering completion providers more than once
// (beforeMount can fire again if the Editor instance remounts).
let completionProvidersRegistered = false;

/**
 * Builds a Monaco completion item list from plain keyword strings.
 */
function buildKeywordItems(
  monacoNS: typeof import("monaco-editor"),
  keywords: string[]
): languages.CompletionItem[] {
  return keywords.map((word) => ({
    label: word,
    kind: monacoNS.languages.CompletionItemKind.Keyword,
    insertText: word,
    range: undefined as unknown as languages.CompletionItem["range"],
  }));
}

/**
 * Builds a Monaco completion item list from plain class/type names.
 */
function buildClassItems(
  monacoNS: typeof import("monaco-editor"),
  classNames: string[]
): languages.CompletionItem[] {
  return classNames.map((name) => ({
    label: name,
    kind: monacoNS.languages.CompletionItemKind.Class,
    insertText: name,
    range: undefined as unknown as languages.CompletionItem["range"],
  }));
}

/**
 * Registers a CompletionItemProvider for a given Monaco language id.
 * Suggestions include keywords, common classes, and code snippets.
 */
function registerLanguageCompletions(
  monacoNS: typeof import("monaco-editor"),
  languageId: string,
  keywords: string[],
  classNames: string[],
  snippets: { label: string; insertText: string; detail: string }[]
): void {
  monacoNS.languages.registerCompletionItemProvider(languageId, {
    triggerCharacters: [".", " "],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range: languages.CompletionItem["range"] = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const keywordItems: languages.CompletionItem[] = keywords.map((kw) => ({
        label: kw,
        kind: monacoNS.languages.CompletionItemKind.Keyword,
        insertText: kw,
        range,
      }));

      const classItems: languages.CompletionItem[] = classNames.map((cls) => ({
        label: cls,
        kind: monacoNS.languages.CompletionItemKind.Class,
        insertText: cls,
        range,
      }));

      const snippetItems: languages.CompletionItem[] = snippets.map((snip) => ({
        label: snip.label,
        kind: monacoNS.languages.CompletionItemKind.Snippet,
        insertText: snip.insertText,
        insertTextRules:
          monacoNS.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: snip.detail,
        range,
      }));

      return {
        suggestions: [...keywordItems, ...classItems, ...snippetItems],
      };
    },
  });
}

/**
 * Registers Level 1 IntelliSense (keywords, common classes, and snippets)
 * for each supported language. Runs once, before the editor mounts.
 */
const handleEditorWillMount = (monacoInstance: typeof import("monaco-editor")) => {
  if (completionProvidersRegistered) {
    return;
  }
  completionProvidersRegistered = true;

  // ---------------------------------------------------------
  // Java
  // ---------------------------------------------------------
  registerLanguageCompletions(
    monacoInstance,
    "java",
    [
      "public", "private", "protected", "class", "interface", "static", "final",
      "void", "int", "double", "float", "boolean", "char", "long", "short", "byte",
      "new", "return", "if", "else", "switch", "case", "default", "while", "do",
      "for", "break", "continue", "try", "catch", "finally", "throw", "throws",
      "import", "package", "extends", "implements",
    ],
    [
      "System", "String", "Scanner", "ArrayList", "HashMap", "HashSet",
      "LinkedList", "Math", "Arrays", "Collections", "Random", "Exception",
    ],
    [
      {
        label: "main",
        detail: "public static void main(String[] args)",
        insertText:
          "public static void main(String[] args) {\n\t${0}\n}",
      },
      {
        label: "class",
        detail: "public class Main",
        insertText: "public class ${1:Main} {\n\t${0}\n}",
      },
      {
        label: "for",
        detail: "for loop",
        insertText:
          "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${0}\n}",
      },
      {
        label: "if",
        detail: "if statement",
        insertText: "if (${1:condition}) {\n\t${0}\n}",
      },
      {
        label: "while",
        detail: "while loop",
        insertText: "while (${1:condition}) {\n\t${0}\n}",
      },
      {
        label: "System.out.println",
        detail: "Print line",
        insertText: "System.out.println(${0});",
      },
    ]
  );

  // ---------------------------------------------------------
  // Python
  // ---------------------------------------------------------
  registerLanguageCompletions(
    monacoInstance,
    "python",
    [
      "def", "class", "return", "if", "elif", "else", "for", "while", "break",
      "continue", "try", "except", "finally", "raise", "import", "from", "as",
      "with", "lambda", "pass", "global", "nonlocal", "yield", "True", "False",
      "None", "and", "or", "not", "in", "is",
    ],
    ["list", "dict", "set", "tuple", "str", "int", "float", "bool", "range", "Exception"],
    [
      {
        label: "def",
        detail: "function definition",
        insertText: "def ${1:name}(${2:params}):\n\t${0}",
      },
      {
        label: "class",
        detail: "class definition",
        insertText: "class ${1:Name}:\n\tdef __init__(self):\n\t\t${0}",
      },
      {
        label: "for",
        detail: "for loop",
        insertText: "for ${1:item} in ${2:iterable}:\n\t${0}",
      },
      {
        label: "if",
        detail: "if statement",
        insertText: "if ${1:condition}:\n\t${0}",
      },
      {
        label: "main",
        detail: "main guard",
        insertText: 'if __name__ == "__main__":\n\t${0}',
      },
      {
        label: "print",
        detail: "print statement",
        insertText: "print(${0})",
      },
    ]
  );

  // ---------------------------------------------------------
  // JavaScript
  // ---------------------------------------------------------
  registerLanguageCompletions(
    monacoInstance,
    "javascript",
    [
      "const", "let", "var", "function", "return", "if", "else", "switch",
      "case", "default", "for", "while", "do", "break", "continue", "try",
      "catch", "finally", "throw", "class", "extends", "new", "import",
      "export", "async", "await", "typeof", "instanceof",
    ],
    ["console", "Array", "Object", "Map", "Set", "Promise", "Math", "JSON", "Error"],
    [
      {
        label: "function",
        detail: "function declaration",
        insertText: "function ${1:name}(${2:params}) {\n\t${0}\n}",
      },
      {
        label: "for",
        detail: "for loop",
        insertText:
          "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${0}\n}",
      },
      {
        label: "if",
        detail: "if statement",
        insertText: "if (${1:condition}) {\n\t${0}\n}",
      },
      {
        label: "console.log",
        detail: "Log to console",
        insertText: "console.log(${0});",
      },
      {
        label: "arrow",
        detail: "arrow function",
        insertText: "const ${1:name} = (${2:params}) => {\n\t${0}\n};",
      },
    ]
  );

  // ---------------------------------------------------------
  // TypeScript
  // ---------------------------------------------------------
  registerLanguageCompletions(
    monacoInstance,
    "typescript",
    [
      "const", "let", "var", "function", "return", "if", "else", "switch",
      "case", "default", "for", "while", "do", "break", "continue", "try",
      "catch", "finally", "throw", "class", "extends", "implements", "new",
      "import", "export", "async", "await", "interface", "type", "enum",
      "public", "private", "protected", "readonly",
    ],
    ["console", "Array", "Object", "Map", "Set", "Promise", "Math", "JSON", "Error"],
    [
      {
        label: "function",
        detail: "function declaration",
        insertText: "function ${1:name}(${2:params}): ${3:void} {\n\t${0}\n}",
      },
      {
        label: "interface",
        detail: "interface declaration",
        insertText: "interface ${1:Name} {\n\t${0}\n}",
      },
      {
        label: "for",
        detail: "for loop",
        insertText:
          "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${0}\n}",
      },
      {
        label: "if",
        detail: "if statement",
        insertText: "if (${1:condition}) {\n\t${0}\n}",
      },
      {
        label: "console.log",
        detail: "Log to console",
        insertText: "console.log(${0});",
      },
    ]
  );

  // ---------------------------------------------------------
  // C
  // ---------------------------------------------------------
  registerLanguageCompletions(
    monacoInstance,
    "c",
    [
      "int", "float", "double", "char", "void", "long", "short", "unsigned",
      "signed", "struct", "union", "enum", "typedef", "return", "if", "else",
      "switch", "case", "default", "for", "while", "do", "break", "continue",
      "sizeof", "const", "static", "extern",
    ],
    ["printf", "scanf", "malloc", "free", "NULL", "FILE"],
    [
      {
        label: "main",
        detail: "main function",
        insertText: "int main() {\n\t${0}\n\treturn 0;\n}",
      },
      {
        label: "for",
        detail: "for loop",
        insertText:
          "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${0}\n}",
      },
      {
        label: "if",
        detail: "if statement",
        insertText: "if (${1:condition}) {\n\t${0}\n}",
      },
      {
        label: "printf",
        detail: "Print formatted output",
        insertText: 'printf("${1:%d}\\n", ${0});',
      },
    ]
  );

  // ---------------------------------------------------------
  // C++
  // ---------------------------------------------------------
  registerLanguageCompletions(
    monacoInstance,
    "cpp",
    [
      "int", "float", "double", "char", "void", "long", "short", "unsigned",
      "signed", "class", "struct", "public", "private", "protected", "static",
      "const", "return", "if", "else", "switch", "case", "default", "for",
      "while", "do", "break", "continue", "new", "delete", "namespace",
      "using", "template", "typename", "virtual",
    ],
    ["std", "cout", "cin", "endl", "vector", "map", "set", "string", "pair"],
    [
      {
        label: "main",
        detail: "main function",
        insertText: "int main() {\n\t${0}\n\treturn 0;\n}",
      },
      {
        label: "for",
        detail: "for loop",
        insertText:
          "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${0}\n}",
      },
      {
        label: "if",
        detail: "if statement",
        insertText: "if (${1:condition}) {\n\t${0}\n}",
      },
      {
        label: "cout",
        detail: "Print to console",
        insertText: "std::cout << ${0} << std::endl;",
      },
    ]
  );

  // ---------------------------------------------------------
  // Go
  // ---------------------------------------------------------
  registerLanguageCompletions(
    monacoInstance,
    "go",
    [
      "func", "package", "import", "var", "const", "type", "struct",
      "interface", "return", "if", "else", "switch", "case", "default",
      "for", "range", "break", "continue", "go", "chan", "select", "defer",
      "map", "nil",
    ],
    ["fmt", "string", "int", "float64", "bool", "error"],
    [
      {
        label: "main",
        detail: "main function",
        insertText: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t${0}\n}',
      },
      {
        label: "func",
        detail: "function declaration",
        insertText: "func ${1:name}(${2:params}) ${3:returnType} {\n\t${0}\n}",
      },
      {
        label: "for",
        detail: "for loop",
        insertText: "for ${1:i} := 0; ${1:i} < ${2:length}; ${1:i}++ {\n\t${0}\n}",
      },
      {
        label: "if",
        detail: "if statement",
        insertText: "if ${1:condition} {\n\t${0}\n}",
      },
      {
        label: "fmt.Println",
        detail: "Print line",
        insertText: "fmt.Println(${0})",
      },
    ]
  );

  // ---------------------------------------------------------
  // Rust
  // ---------------------------------------------------------
  registerLanguageCompletions(
    monacoInstance,
    "rust",
    [
      "fn", "let", "mut", "const", "struct", "enum", "impl", "trait", "return",
      "if", "else", "match", "for", "while", "loop", "break", "continue",
      "use", "mod", "pub", "self", "Self", "async", "await",
    ],
    ["String", "Vec", "Option", "Result", "HashMap", "HashSet", "Box"],
    [
      {
        label: "main",
        detail: "main function",
        insertText: "fn main() {\n\t${0}\n}",
      },
      {
        label: "fn",
        detail: "function declaration",
        insertText: "fn ${1:name}(${2:params}) -> ${3:ReturnType} {\n\t${0}\n}",
      },
      {
        label: "for",
        detail: "for loop",
        insertText: "for ${1:item} in ${2:iterable} {\n\t${0}\n}",
      },
      {
        label: "if",
        detail: "if statement",
        insertText: "if ${1:condition} {\n\t${0}\n}",
      },
      {
        label: "println!",
        detail: "Print line",
        insertText: 'println!("${0}");',
      },
    ]
  );
};

/**
 * CodeInput Component
 * Premium code entry workspace built around Monaco Editor (VS Code's editor),
 * configured with full IDE-like behavior and Level 1 IntelliSense
 * (keyword, class, and snippet completions) for common languages.
 * Manages its own internal state so it can be dropped into any part of
 * the app independently.
 */
const CodeInput: React.FC<CodeInputProps> = ({
  initialCode = "",
  onBeforeAnalyze,
  initialLanguage = LANGUAGES[0],
  placeholder = "Paste your code here...",
  onAnalysisComplete,
  onClear,
  onPasteClick,
}) => {
  // Holds the code typed/pasted by the user
  const [code, setCode] = useState<string>(initialCode);
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // Holds the currently selected language
  const [language, setLanguage] = useState<string>(initialLanguage);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [runInput, setRunInput] = useState<string>("");
  const [runOutput, setRunOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleRun = async (): Promise<void> => {
    if (!code.trim()) {
      console.warn("CodeInput: no code provided to run.");
      return;
    }

    setIsRunning(true);
    setRunOutput("");
    setExecutionTime(null);

    try {
      const backendLanguage = BACKEND_LANGUAGE_MAP[language] ?? "python";

      const response = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: backendLanguage,
          input: runInput,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to run code.");
      }

      let displayOutput = "";

      if (data.output) {
        displayOutput += data.output;
      }

      if (data.error) {
        if (displayOutput) {
          displayOutput += "\n";
        }
        displayOutput += data.error;
      }

      if (data.executionTime !== null && data.executionTime !== undefined) {
        setExecutionTime(data.executionTime);
        if (displayOutput) {
          displayOutput += "\n";
        }
        displayOutput += `\nExecution time: ${data.executionTime} ms`;
      }

      setRunOutput(displayOutput || "Program executed with no output.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("CodeInput: failed to run code.", error);
      setRunOutput(`Error: ${message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Derived counts — recalculated on every render from current code state
  const lineCount = code.length === 0 ? 0 : code.split("\n").length;
  const charCount = code.length;

  // Resolves the Monaco language id for the currently selected language
  const monacoLanguage = MONACO_LANGUAGE_MAP[language] ?? "plaintext";

  // Resolves the display filename for the currently selected language
  const fileName = FILE_EXTENSION_MAP[language] ?? "main.txt";

  // Updates code state on editor content change
  const handleEditorChange = (value: string | undefined): void => {
    setCode(value ?? "");
  };

  // Updates selected language on dropdown change
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setLanguage(event.target.value);
  };

  // Handles the "Analyze Code" button click — sends code to the backend for analysis
  const handleAnalyzeClick = async (): Promise<void> => 
    {
    try {
      if (!code.trim()) {
        console.warn("CodeInput: no code provided to analyze.");
        return;
      }
      onBeforeAnalyze?.(code, language);
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to analyze code.");
      }

      onAnalysisComplete?.(data.analysis);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("CodeInput: failed to analyze code.", error);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles the "Clear" button click — resets the editor content
  const handleClearClick = (): void => {
    setCode("");
    onClear?.();
  };

  // Placeholder handler — clipboard functionality to be added later
  const handlePasteClick = (): void => {
    onPasteClick?.();
  };

  return (
    <div className="code-input">
      {/* Professional file toolbar above the editor */}
      <div className="code-input__toolbar">
        <div className="code-input__toolbar-left">
          <span className="material-symbols-outlined code-input__toolbar-menu-icon">
            menu
          </span>
          <span className="material-symbols-outlined code-input__toolbar-file-icon">
            description
          </span>
          <span className="code-input__toolbar-filename">{fileName}</span>
          <span className="code-input__toolbar-saved-badge">
            <span className="code-input__toolbar-saved-dot" />
            Saved
          </span>
        </div>

        <div className="code-input__toolbar-right">
          <label htmlFor="code-input-language" className="code-input__language-label">
            <select
              id="code-input-language"
              className="code-input__language-select"
              value={language}
              onChange={handleLanguageChange}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined code-input__language-caret">
              expand_more
            </span>
          </label>
        </div>
      </div>

      {/* Monaco Editor — configured for full IDE-like behavior + IntelliSense */}
      <div className="code-input__editor-wrapper">
        <Editor
          height={window.innerWidth > 1200 ? "430px" : "360px"}
          language={monacoLanguage}
          theme="vs-dark"
          value={code}
          beforeMount={handleEditorWillMount}
          onChange={handleEditorChange}
          options={{
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            fontSize: 14,

            // Layout
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            minimap: { enabled: false },
            wordWrap: "off",
            stickyScroll: { enabled: true },

            // Indentation
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: true,
            autoIndent: "full",

            // Brackets, quotes, and auto-surround (VS Code-like typing behavior)
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoSurround: "languageDefined",
            matchBrackets: "always",
            bracketPairColorization: { enabled: true },
            guides: {
              indentation: true,
              bracketPairs: true,
            },
            linkedEditing: true,

            // Formatting
            formatOnPaste: true,
            formatOnType: true,

            // Folding
            folding: true,
            foldingStrategy: "indentation",

            // Rendering
            renderWhitespace: "selection",
            renderControlCharacters: true,
            renderLineHighlight: "all",

            // Cursor & scrolling
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,

            // IntelliSense / suggestions
            tabCompletion: "on",
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            snippetSuggestions: "top",
            acceptSuggestionOnEnter: "on",

            lineNumbers: "on",
            placeholder,
          }}
        />
        <LoadingOverlay isVisible={isLoading} />
      </div>  
      {/* Information chips: lines, characters, language */}
      <div className="code-input__chips">
        <span className="code-input__chip">
          <span className="material-symbols-outlined code-input__chip-icon">
            format_list_numbered
          </span>
          Lines: {lineCount}
        </span>
        <span className="code-input__chip">
          <span className="material-symbols-outlined code-input__chip-icon">
            text_fields
          </span>
          Characters: {charCount}
        </span>
        <span className="code-input__chip">
          <span className="material-symbols-outlined code-input__chip-icon">code</span>
          {language}
        </span>
      </div>

      {/* Action buttons */}
      <div className="code-input__actions">
      <button
  type="button"
  className={`code-input__btn code-input__btn--primary${
    isLoading ? " code-input__btn--loading" : ""
  }`}
  onClick={handleAnalyzeClick}
  disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? (
    <>
      <span
        className="material-symbols-outlined code-input__btn-spinner"
        aria-hidden="true"
      >
        autorenew
      </span>
      Analyzing...
    </>
  ) : (
            "Analyze Code"
          )}
        </button>

        <button
          type="button"
          className="code-input__btn code-input__btn--secondary"
          onClick={handleClearClick}
        >
          Clear
        </button>

        <button
          type="button"
          className="code-input__btn code-input__btn--secondary"
          onClick={handlePasteClick}
        >
          Paste from Clipboard
        </button>
      </div>

      {/* Run Code panel */}
      <RunCode
        onRun={handleRun}
        isRunning={isRunning}
        input={runInput}
        onInputChange={setRunInput}
        output={runOutput}
      />
    </div>
  );
};

export default CodeInput;