import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";
import ReconnectingWebSocket from "reconnecting-websocket";
import { createOnigScanner, createOnigString, loadWASM } from "vscode-oniguruma";
import { Registry, parseRawGrammar, type IGrammar, INITIAL } from "vscode-textmate";
import ucodeGrammar from "./ucode.tmLanguage.json";

type JSONRPCMessage = {
	jsonrpc: "2.0";
	id?: number | string;
	method?: string;
	params?: any;
	result?: any;
	error?: { code: number; message: string; data?: any };
};

class LspConnection {
	private socket: ReconnectingWebSocket;
	private nextId = 1;
	private pending = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
	private notificationHandlers = new Map<string, (params: any) => void>();
    private requestHandlers = new Map<string, (params: any) => Promise<any> | any>();

	constructor(url: string) {
		this.socket = new ReconnectingWebSocket(url, [], { maxRetries: 10 });
        this.socket.addEventListener('message', async (event) => {
			try {
				const msg: JSONRPCMessage = JSON.parse(event.data);
                // Response from server to a request we sent
                if (msg.id !== undefined && (msg.result !== undefined || msg.error)) {
					const waiter = this.pending.get(msg.id as number);
					if (waiter) {
						this.pending.delete(msg.id as number);
						if (msg.error) waiter.reject(msg.error);
						else waiter.resolve(msg.result);
					}
                // Incoming request from server to client
                } else if (msg.id !== undefined && msg.method) {
                    const handler = this.requestHandlers.get(msg.method);
                    try {
                        const result = handler ? await handler(msg.params) : null;
                        const response: JSONRPCMessage = { jsonrpc: '2.0', id: msg.id, result };
                        this.socket.send(JSON.stringify(response));
                    } catch (err: any) {
                        const error: JSONRPCMessage = { jsonrpc: '2.0', id: msg.id, error: { code: -32603, message: String(err?.message || err) } };
                        this.socket.send(JSON.stringify(error));
                    }
                // Notification from server
                } else if (msg.method) {
                    const handler = this.notificationHandlers.get(msg.method);
                    if (handler) handler(msg.params);
				}
			} catch (e) {
				console.error('LSP message parse error', e);
			}
		});
	}

	sendRequest(method: string, params: any): Promise<any> {
		const id = this.nextId++;
		const message: JSONRPCMessage = { jsonrpc: '2.0', id, method, params };
		this.socket.send(JSON.stringify(message));
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
		});
	}

	sendNotification(method: string, params: any): void {
		const message: JSONRPCMessage = { jsonrpc: '2.0', method, params };
		this.socket.send(JSON.stringify(message));
	}

	onNotification(method: string, handler: (params: any) => void): void {
		this.notificationHandlers.set(method, handler);
	}

    onRequest(method: string, handler: (params: any) => Promise<any> | any): void {
        this.requestHandlers.set(method, handler);
    }
}

function createUrl(): string {
	const hostname = window.location.hostname || "localhost";
	const protocol = window.location.protocol === "https:" ? "wss" : "ws";
	// In dev (Vite on 5173), connect directly to the LSP bridge port
	// In production (served by nginx on 80/443), use the /lsp proxy path
	if (window.location.port !== "" && window.location.port !== "80" && window.location.port !== "443") {
		return `${protocol}://${hostname}:6005`;
	}
	return `${protocol}://${hostname}/lsp`;
}

// Map TextMate scopes to Monaco token types for vs-dark theme
function tmScopeToMonacoToken(scopes: string[]): string {
	for (let i = scopes.length - 1; i >= 0; i--) {
		const scope = scopes[i];
		if (scope.startsWith("comment")) return "comment";
		if (scope.startsWith("string.regexp")) return "regexp";
		if (scope.startsWith("string.template")) return "string";
		if (scope.startsWith("string")) return "string";
		if (scope.startsWith("constant.numeric")) return "number";
		if (scope.startsWith("constant.language")) return "constant";
		if (scope.startsWith("constant.character.escape")) return "string.escape";
		if (scope.startsWith("keyword.control.module")) return "keyword";
		if (scope.startsWith("keyword.control.interpolation")) return "delimiter.bracket";
		if (scope.startsWith("keyword.control")) return "keyword";
		if (scope.startsWith("keyword.operator.arrow")) return "keyword";
		if (scope.startsWith("keyword.operator.delete")) return "keyword";
		if (scope.startsWith("keyword.operator")) return "operator";
		if (scope.startsWith("storage.type")) return "keyword";
		if (scope.startsWith("support.function.builtin")) return "predefined";
		if (scope.startsWith("entity.name.function.method")) return "member";
		if (scope.startsWith("entity.name.function")) return "function";
		if (scope.startsWith("variable.other.property")) return "property";
		if (scope.startsWith("variable")) return "variable";
		if (scope.startsWith("meta.embedded.block")) return "metatag";
	}
	return "";
}

let grammarPromise: Promise<IGrammar | null> | null = null;

async function getGrammar(): Promise<IGrammar | null> {
	if (grammarPromise) return grammarPromise;
	grammarPromise = (async () => {
		const wasmResponse = await fetch("/onig.wasm");
		const wasmBuffer = await wasmResponse.arrayBuffer();
		await loadWASM(wasmBuffer);

		const registry = new Registry({
			onigLib: Promise.resolve({ createOnigScanner, createOnigString }),
			loadGrammar: async (scopeName: string) => {
				if (scopeName === "source.ucode") {
					return parseRawGrammar(JSON.stringify(ucodeGrammar), "ucode.tmLanguage.json");
				}
				return null;
			},
		});

		return registry.loadGrammar("source.ucode");
	})();
	return grammarPromise;
}

interface UcodeEditorProps {
	value?: string;
	onChange?: (code: string) => void;
}

export default function UcodeEditor({ value, onChange }: UcodeEditorProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

	// Update editor content when value prop changes externally
	useEffect(() => {
		const editor = editorRef.current;
		if (editor && value !== undefined && value !== editor.getValue()) {
			editor.setValue(value);
		}
	}, [value]);

	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;

		// Register language id
		monaco.languages.register({ id: "ucode", extensions: [".uc"], mimetypes: ["text/x-ucode"] });

		// Define a theme with rules for our token types
		monaco.editor.defineTheme("ucode-dark", {
			base: "vs-dark",
			inherit: true,
			colors: {},
			rules: [
				{ token: "comment", foreground: "6A9955", fontStyle: "italic" },
				{ token: "string", foreground: "CE9178" },
				{ token: "string.escape", foreground: "D7BA7D" },
				{ token: "number", foreground: "B5CEA8" },
				{ token: "constant", foreground: "569CD6" },
				{ token: "keyword", foreground: "C586C0" },
				{ token: "operator", foreground: "D4D4D4" },
				{ token: "predefined", foreground: "DCDCAA" },
				{ token: "function", foreground: "DCDCAA" },
				{ token: "member", foreground: "DCDCAA" },
				{ token: "property", foreground: "9CDCFE" },
				{ token: "variable", foreground: "9CDCFE" },
				{ token: "regexp", foreground: "D16969" },
				{ token: "delimiter.bracket", foreground: "C586C0" },
				{ token: "metatag", foreground: "D4D4D4" },
			],
		});

		const disposables: monaco.IDisposable[] = [];

		// Wire up TextMate grammar for syntax highlighting
		getGrammar().then((grammar) => {
			if (!grammar) return;

			class TMState implements monaco.languages.IState {
				constructor(public ruleStack: import("vscode-textmate").StateStack) {}
				clone(): TMState { return new TMState(this.ruleStack); }
				equals(other: monaco.languages.IState): boolean {
					return other instanceof TMState && other.ruleStack === this.ruleStack;
				}
			}

			const tokensDisposable = monaco.languages.setTokensProvider("ucode", {
				getInitialState: () => new TMState(INITIAL),
				tokenize: (line: string, state: TMState) => {
					const result = grammar.tokenizeLine(line, state.ruleStack);
					const tokens = result.tokens.map((t) => ({
						startIndex: t.startIndex,
						scopes: tmScopeToMonacoToken(t.scopes),
					}));
					return { tokens, endState: new TMState(result.ruleStack) };
				},
			});
			disposables.push(tokensDisposable);
		});

		const model = monaco.editor.createModel(
			value ?? 'print("Hello from ucode");',
			"ucode",
			monaco.Uri.parse("inmemory://model.uc")
		);

		const editor = monaco.editor.create(element, {
			model,
			theme: "ucode-dark",
			automaticLayout: true,
			minimap: { enabled: false },
			fixedOverflowWidgets: true,
			wordWrap: "on",
			scrollbar: {
				vertical: "hidden",
				horizontal: "hidden",
			},
			overviewRulerLanes: 0,
			hideCursorInOverviewRuler: true,
			overviewRulerBorder: false,
			scrollBeyondLastLine: false,
		});
		editorRef.current = editor;

        const url = createUrl();
        const lsp = new LspConnection(url);

		const uri = "inmemory://model.uc";
		let version = 1;

		const initialize = async () => {
			await lsp.sendRequest('initialize', {
				processId: null,
				clientInfo: { name: 'ucode-web', version: '1.0.0' },
				rootUri: null,
				capabilities: {
					textDocument: {
						publishDiagnostics: { relatedInformation: true },
						codeAction: {
							codeActionLiteralSupport: {
								codeActionKind: {
									valueSet: ['quickfix', 'refactor', 'source']
								}
							},
							dataSupport: true,
							resolveSupport: { properties: ['edit'] }
						},
						hover: { contentFormat: ['markdown', 'plaintext'] },
						completion: {
							completionItem: { snippetSupport: false, documentationFormat: ['markdown', 'plaintext'] }
						}
					}
				},
				workspaceFolders: null
			});
			lsp.sendNotification('initialized', {});
			lsp.sendNotification('textDocument/didOpen', {
				textDocument: {
					uri,
					languageId: 'ucode',
					version,
					text: model.getValue()
				}
			});
		};

		initialize().catch(console.error);

        // Respond to common server->client requests
        lsp.onRequest('workspace/configuration', (params) => {
            const items = Array.isArray(params?.items) ? params.items : [];
            return items.map(() => ({}));
        });
        lsp.onRequest('client/registerCapability', () => null);
        lsp.onRequest('client/unregisterCapability', () => null);
        lsp.onRequest('workspace/workspaceFolders', () => null);
        lsp.onRequest('window/workDoneProgress/create', () => null);

        // Suppress server log messages
        lsp.onNotification('window/logMessage', () => {});

		model.onDidChangeContent(() => {
			version += 1;
			lsp.sendNotification('textDocument/didChange', {
				textDocument: { uri, version },
				contentChanges: [{ text: model.getValue() }]
			});
			if (onChange) onChange(model.getValue());
		});

		// Diagnostics — store raw LSP diagnostics for code action requests
		let lastDiagnostics: any[] = [];
		lsp.onNotification('textDocument/publishDiagnostics', (params) => {
			if (params.uri !== uri) return;
			lastDiagnostics = params.diagnostics || [];
            const markers = lastDiagnostics.map((d: any) => ({
                severity: d.severity === 1 ? monaco.MarkerSeverity.Error
                    : d.severity === 2 ? monaco.MarkerSeverity.Warning
                    : d.severity === 3 ? monaco.MarkerSeverity.Info
                    : monaco.MarkerSeverity.Hint,
				message: d.message,
				startLineNumber: d.range.start.line + 1,
				startColumn: d.range.start.character + 1,
				endLineNumber: d.range.end.line + 1,
				endColumn: d.range.end.character + 1,
				source: d.source,
				code: d.code,
			}));
			monaco.editor.setModelMarkers(model, 'ucode', markers);
		});

		// Code Actions (Quick Fixes)
		disposables.push(monaco.languages.registerCodeActionProvider('ucode', {
			provideCodeActions: async (m, range, context) => {
				// Match raw LSP diagnostics to the markers in this range
				const lspRange = {
					start: { line: range.startLineNumber - 1, character: range.startColumn - 1 },
					end: { line: range.endLineNumber - 1, character: range.endColumn - 1 },
				};
				const relevantDiagnostics = lastDiagnostics.filter((d: any) => {
					const dl = d.range.start.line;
					return dl >= lspRange.start.line && dl <= lspRange.end.line;
				});
				const params = {
					textDocument: { uri },
					range: lspRange,
					context: { diagnostics: relevantDiagnostics },
				};
				const result = await lsp.sendRequest('textDocument/codeAction', params);
				if (!result || !Array.isArray(result)) return { actions: [], dispose: () => {} };
				const actions: monaco.languages.CodeAction[] = result.map((action: any) => {
					const edits: monaco.languages.WorkspaceTextEdit[] = [];
					// Handle edit.changes
					if (action.edit?.changes) {
						for (const [, changes] of Object.entries(action.edit.changes as Record<string, any[]>)) {
							for (const change of changes) {
								edits.push({
									resource: model.uri,
									textEdit: {
										range: new monaco.Range(
											change.range.start.line + 1, change.range.start.character + 1,
											change.range.end.line + 1, change.range.end.character + 1,
										),
										text: change.newText,
									},
									versionId: undefined,
								});
							}
						}
					}
					// Handle edit.documentChanges
					if (action.edit?.documentChanges) {
						for (const docChange of action.edit.documentChanges) {
							if (docChange.edits) {
								for (const change of docChange.edits) {
									edits.push({
										resource: model.uri,
										textEdit: {
											range: new monaco.Range(
												change.range.start.line + 1, change.range.start.character + 1,
												change.range.end.line + 1, change.range.end.character + 1,
											),
											text: change.newText,
										},
										versionId: undefined,
									});
								}
							}
						}
					}
					return {
						title: action.title,
						kind: action.kind,
						diagnostics: action.diagnostics,
						edit: edits.length ? { edits } : undefined,
					};
				});
				return { actions, dispose: () => {} };
			},
		}));

		// Completion
		disposables.push(monaco.languages.registerCompletionItemProvider('ucode', {
			triggerCharacters: ['.', '\'', '"', ',', '('],
			provideCompletionItems: async (m, position) => {
				const result = await lsp.sendRequest('textDocument/completion', {
					textDocument: { uri },
					position: { line: position.lineNumber - 1, character: position.column - 1 }
				});
				const items = (Array.isArray(result) ? result : result?.items || []).map((it: any) => ({
					label: it.label,
					kind: it.kind,
					insertText: it.insertText || it.label,
					detail: it.detail,
					documentation: typeof it.documentation === 'string' ? it.documentation : it.documentation?.value,
				}));
				return { suggestions: items } as monaco.languages.CompletionList;
			}
		}));

		// Hover
		disposables.push(monaco.languages.registerHoverProvider('ucode', {
			provideHover: async (m, position) => {
				const result = await lsp.sendRequest('textDocument/hover', {
					textDocument: { uri },
					position: { line: position.lineNumber - 1, character: position.column - 1 }
				});
				if (!result) return { contents: [] };
				const contents = Array.isArray(result.contents) ? result.contents : [result.contents];
				return { contents: contents.map((c: any) => (typeof c === 'string' ? { value: c } : c)) } as monaco.languages.Hover;
			}
		}));

		return () => {
			disposables.forEach(d => d.dispose());
			editorRef.current = null;
			editor.dispose();
			model.dispose();
		};
	}, []);

	return (
		<>
			<style>{`
				.action-widget {
					min-width: 500px !important;
					max-width: 700px !important;
				}
				.action-widget .title {
					margin-top: 0 !important;
					margin-bottom: 0 !important;
					font-weight: normal !important;
				}
			`}</style>
			<div
				className="ucode-editor-wrapper"
				ref={containerRef}
				style={{ height: "400px", width: "100%", border: "1px solid #333", borderRadius: 8 }}
			/>
		</>
	);
}


