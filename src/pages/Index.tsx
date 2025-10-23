import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

const systemPromptData = {
  prompt: `You are Claude Code, an AI assistant specialized in helping developers build applications.

Your key capabilities:
- Analyze and understand codebases
- Write clean, maintainable code
- Debug and fix issues
- Suggest best practices
- Create comprehensive documentation

Always follow these principles:
1. Write clear, readable code
2. Use proper error handling
3. Follow security best practices
4. Optimize for performance
5. Maintain consistency`,
  
  schema: {
    type: "object",
    properties: {
      role: {
        type: "string",
        description: "AI assistant role identifier",
        enum: ["assistant", "developer", "architect"]
      },
      capabilities: {
        type: "array",
        items: {
          type: "string"
        },
        description: "List of core capabilities"
      },
      context: {
        type: "object",
        properties: {
          language: { type: "string" },
          framework: { type: "string" },
          projectType: { type: "string" }
        }
      },
      constraints: {
        type: "object",
        properties: {
          maxTokens: { type: "number" },
          temperature: { type: "number" },
          topP: { type: "number" }
        }
      }
    },
    required: ["role", "capabilities"]
  },
  
  examples: [
    {
      title: "Code Generation Request",
      input: "Create a React component for user authentication",
      output: "I'll create a secure authentication component with form validation...",
      tags: ["react", "auth", "component"]
    },
    {
      title: "Debug Assistance",
      input: "Why is my API call failing with CORS error?",
      output: "CORS errors occur when the browser blocks requests. Here's how to fix it...",
      tags: ["api", "debugging", "cors"]
    },
    {
      title: "Code Review",
      input: "Review this function for performance issues",
      output: "I've identified several optimization opportunities...",
      tags: ["performance", "review"]
    }
  ],
  
  api: [
    {
      endpoint: "/v1/chat/completions",
      method: "POST",
      description: "Main chat completion endpoint for conversational interactions",
      parameters: {
        model: "string (required)",
        messages: "array (required)",
        temperature: "number (0-1)",
        max_tokens: "number"
      }
    },
    {
      endpoint: "/v1/tools/execute",
      method: "POST",
      description: "Execute specific tool functions like file operations",
      parameters: {
        tool: "string (required)",
        params: "object (required)"
      }
    }
  ]
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('prompt');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Icon name="Terminal" className="text-primary" size={20} />
            <span className="text-sm font-mono font-semibold text-primary">System Documentation</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-700 bg-clip-text text-transparent">
            System Prompt Explorer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Интерактивная документация для изучения системных промптов, схем и API endpoints
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-scale-in">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-14 p-1 bg-white/80 backdrop-blur-sm shadow-sm">
            <TabsTrigger value="prompt" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="FileText" size={18} className="mr-2" />
              Промпт
            </TabsTrigger>
            <TabsTrigger value="schema" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Braces" size={18} className="mr-2" />
              Схема
            </TabsTrigger>
            <TabsTrigger value="examples" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Code" size={18} className="mr-2" />
              Примеры
            </TabsTrigger>
            <TabsTrigger value="api" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Network" size={18} className="mr-2" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="animate-fade-in">
            <Card className="p-8 shadow-lg border-slate-200/50 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon name="FileText" className="text-primary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">System Prompt</h2>
                    <p className="text-sm text-muted-foreground">Основные инструкции для AI ассистента</p>
                  </div>
                </div>
                <Button
                  onClick={() => copyToClipboard(systemPromptData.prompt, 'prompt')}
                  variant="outline"
                  className="gap-2"
                >
                  <Icon name={copiedCode === 'prompt' ? 'Check' : 'Copy'} size={16} />
                  {copiedCode === 'prompt' ? 'Скопировано' : 'Копировать'}
                </Button>
              </div>
              <ScrollArea className="h-[500px]">
                <pre className="p-6 bg-code-bg/50 rounded-lg text-sm font-mono leading-relaxed text-slate-800 border border-slate-200">
{systemPromptData.prompt}
                </pre>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="schema" className="animate-fade-in">
            <Card className="p-8 shadow-lg border-slate-200/50 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Icon name="Braces" className="text-accent" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">JSON Schema</h2>
                    <p className="text-sm text-muted-foreground">Структура данных системного промпта</p>
                  </div>
                </div>
                <Button
                  onClick={() => copyToClipboard(JSON.stringify(systemPromptData.schema, null, 2), 'schema')}
                  variant="outline"
                  className="gap-2"
                >
                  <Icon name={copiedCode === 'schema' ? 'Check' : 'Copy'} size={16} />
                  {copiedCode === 'schema' ? 'Скопировано' : 'Копировать'}
                </Button>
              </div>
              <ScrollArea className="h-[500px]">
                <pre className="p-6 bg-code-bg/50 rounded-lg text-sm font-mono leading-relaxed text-slate-800 border border-slate-200">
{JSON.stringify(systemPromptData.schema, null, 2)}
                </pre>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="animate-fade-in">
            <div className="space-y-4">
              {systemPromptData.examples.map((example, index) => (
                <Card key={index} className="p-6 shadow-lg border-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{example.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        {example.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="font-mono text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(example.output, `example-${index}`)}
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      <Icon name={copiedCode === `example-${index}` ? 'Check' : 'Copy'} size={14} />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wide">Input</p>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700">{example.input}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wide">Output</p>
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm text-slate-700">{example.output}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="animate-fade-in">
            <div className="space-y-4">
              {systemPromptData.api.map((endpoint, index) => (
                <Card key={index} className="p-6 shadow-lg border-slate-200/50 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <Badge className="bg-accent text-white font-mono text-xs px-3 py-1">
                      {endpoint.method}
                    </Badge>
                    <div className="flex-1">
                      <code className="text-lg font-mono text-slate-900 font-semibold">
                        {endpoint.endpoint}
                      </code>
                      <p className="text-sm text-muted-foreground mt-2">{endpoint.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-code-bg/30 rounded-lg border border-slate-200">
                    <p className="text-xs font-mono font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                      Parameters
                    </p>
                    <div className="space-y-2">
                      {Object.entries(endpoint.parameters).map(([key, value]) => (
                        <div key={key} className="flex items-baseline gap-3 font-mono text-sm">
                          <span className="text-accent font-semibold min-w-[120px]">{key}</span>
                          <span className="text-muted-foreground">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p className="font-mono">
            Создано с использованием React + TypeScript + Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
