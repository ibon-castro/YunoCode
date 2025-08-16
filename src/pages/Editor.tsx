import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Save,
  Share,
  Settings,
  Users,
  MessageSquare,
  Terminal,
  Code,
  FileText,
  Folder
} from "lucide-react";

const Editor = () => {
  const [code, setCode] = useState(`// Welcome to CodeSync!
// Start collaborating with your team in real-time

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// Your teammates can see your changes instantly!`);

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setOutput(`Fibonacci sequence:
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34`);
      setIsRunning(false);
    }, 1000);
  };

  return (
    <div className="h-screen bg-editor-bg text-editor-foreground flex flex-col">
      {/* Top Navigation */}
      <header className="h-12 bg-editor-bg border-b border-editor-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">CodeSync</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Folder className="w-4 h-4" />
            <span>my-project</span>
            <span className="text-muted-foreground">/</span>
            <span>main.js</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-editor-bg border-r border-editor-border">
          {/* File Explorer */}
          <div className="p-4 border-b border-editor-border">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Files
            </h3>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 p-2 rounded bg-editor-border/30 text-primary">
                <Code className="w-4 h-4" />
                <span className="text-sm">main.js</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-editor-border/20 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span className="text-sm">styles.css</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-editor-border/20 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span className="text-sm">index.html</span>
              </div>
            </div>
          </div>

          {/* Collaborators */}
          <div className="p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Collaborators (3)
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">
                  A
                </div>
                <span className="text-sm">Alice (Online)</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                  B
                </div>
                <span className="text-sm">Bob (Typing...)</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                  Y
                </div>
                <span className="text-sm">You</span>
                <div className="w-2 h-2 bg-primary rounded-full ml-auto"></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Editor */}
        <main className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="h-10 bg-editor-bg border-b border-editor-border flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">JavaScript</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={runCode}
                disabled={isRunning}
                className="text-success hover:text-success"
              >
                <Play className="w-4 h-4 mr-1" />
                {isRunning ? "Running..." : "Run"}
              </Button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
              placeholder="Start typing your code..."
            />
          </div>

          {/* Output Panel */}
          <div className="h-48 bg-editor-border/30 border-t border-editor-border">
            <div className="h-8 bg-editor-bg border-b border-editor-border flex items-center px-4">
              <Terminal className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Output</span>
            </div>
            <div className="p-4 h-40 overflow-auto">
              <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                {output || "Click 'Run' to execute your code..."}
              </pre>
            </div>
          </div>
        </main>

        {/* Chat Panel */}
        <aside className="w-80 bg-editor-bg border-l border-editor-border flex flex-col">
          <div className="h-10 bg-editor-bg border-b border-editor-border flex items-center px-4">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Team Chat</span>
          </div>

          <div className="flex-1 p-4 overflow-auto space-y-3">
            <div className="text-xs text-center text-muted-foreground mb-4">
              Today - 2:30 PM
            </div>

            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">
                  A
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-green-400">Alice</div>
                  <div className="text-sm bg-editor-border/30 rounded-lg p-2 mt-1">
                    Hey team! I've set up the basic structure. Feel free to start adding your functions!
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                  B
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-blue-400">Bob</div>
                  <div className="text-sm bg-editor-border/30 rounded-lg p-2 mt-1">
                    Great! I'll work on the optimization part. The fibonacci function could use memoization.
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                  Y
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-primary">You</div>
                  <div className="text-sm bg-primary/20 rounded-lg p-2 mt-1">
                    Perfect! I'll handle the user interface components. This looks awesome already! 🚀
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-editor-border">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-editor-border/30 border border-editor-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" variant="default">
                Send
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;