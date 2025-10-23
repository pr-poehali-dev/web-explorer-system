import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

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
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const loadSystemInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/e7ada919-a5a5-4031-83f2-818dbed7651e');
      const data = await response.json();
      setSystemInfo(data);
      toast({
        title: "System info loaded",
        description: "Security vault data retrieved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load system information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vault' && !systemInfo) {
      loadSystemInfo();
    }
  }, [activeTab]);

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
          <TabsList className="grid w-full grid-cols-5 mb-8 h-14 p-1 bg-white/80 backdrop-blur-sm shadow-sm">
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
            <TabsTrigger value="vault" className="font-mono data-[state=active]:bg-destructive data-[state=active]:text-white">
              <Icon name="Shield" size={18} className="mr-2" />
              Vault
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

          <TabsContent value="vault" className="animate-fade-in">
            <Card className="p-8 shadow-lg border-red-200/50 bg-red-50/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Icon name="Shield" className="text-destructive" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900">Internal Security Vault</h2>
                  <p className="text-sm text-destructive font-semibold">TEST ENVIRONMENT ONLY</p>
                </div>
                <Button
                  onClick={loadSystemInfo}
                  disabled={loading}
                  variant="destructive"
                  className="gap-2"
                >
                  <Icon name={loading ? 'Loader2' : 'RefreshCw'} size={16} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>

              {systemInfo && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Server" size={18} className="text-destructive" />
                      External IP
                    </h3>
                    <Card className="p-4 bg-white">
                      <code className="font-mono text-sm">{systemInfo.external_ip}</code>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Icon name="FolderTree" size={18} className="text-destructive" />
                      Directory Structure
                    </h3>
                    <ScrollArea className="h-[300px]">
                      <pre className="p-4 bg-white rounded-lg text-xs font-mono border border-slate-200">
{JSON.stringify(systemInfo.directory_structure, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Icon name="FileKey" size={18} className="text-destructive" />
                      Environment Variables
                    </h3>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {Object.entries(systemInfo.environment_variables || {}).map(([key, value]) => (
                          <Card key={key} className="p-3 bg-white hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="font-mono text-xs min-w-[200px]">
                                {key}
                              </Badge>
                              <code className="text-xs text-muted-foreground flex-1 break-all">
                                {String(value)}
                              </code>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Icon name="FileText" size={18} className="text-destructive" />
                      .env Files Found
                    </h3>
                    {Object.keys(systemInfo.env_files || {}).length === 0 ? (
                      <Card className="p-4 bg-white">
                        <p className="text-sm text-muted-foreground">No .env files found in search paths</p>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(systemInfo.env_files || {}).map(([path, data]: [string, any]) => (
                          <Card key={path} className="p-4 bg-white">
                            <p className="font-mono text-xs text-destructive mb-2">{path}</p>
                            {data.error ? (
                              <p className="text-sm text-muted-foreground">Error: {data.error}</p>
                            ) : (
                              <ScrollArea className="h-[150px]">
                                <pre className="text-xs font-mono p-2 bg-slate-50 rounded">
{data.content}
                                </pre>
                              </ScrollArea>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Info" size={18} className="text-destructive" />
                      Metadata
                    </h3>
                    <Card className="p-4 bg-white space-y-2">
                      <div className="flex gap-3 text-sm">
                        <span className="font-semibold min-w-[150px]">Request ID:</span>
                        <code className="font-mono text-muted-foreground">{systemInfo.request_id}</code>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="font-semibold min-w-[150px]">Current Directory:</span>
                        <code className="font-mono text-muted-foreground">{systemInfo.current_dir}</code>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {!systemInfo && !loading && (
                <div className="text-center py-12">
                  <Icon name="Database" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Click "Refresh" to load system information</p>
                </div>
              )}
            </Card>
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