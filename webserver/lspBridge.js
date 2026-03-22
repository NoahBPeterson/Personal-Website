import { Server as WSServer } from 'ws';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

function writeLspMessage(stream, json) {
	const body = Buffer.from(JSON.stringify(json), 'utf8');
	const header = Buffer.from(`Content-Length: ${body.length}\r\n\r\n`, 'utf8');
	stream.write(header);
	stream.write(body);
}

function createLspStdoutParser(onMessage) {
	let buffer = Buffer.alloc(0);
	return (chunk) => {
		buffer = Buffer.concat([buffer, chunk]);
		while (true) {
			const headerEnd = buffer.indexOf('\r\n\r\n');
			if (headerEnd === -1) return;
			const header = buffer.slice(0, headerEnd).toString('utf8');
			const match = /Content-Length:\s*(\d+)/i.exec(header);
			if (!match) {
				// Drop invalid content
				buffer = buffer.slice(headerEnd + 4);
				continue;
			}
			const length = parseInt(match[1], 10);
			const start = headerEnd + 4;
			if (buffer.length < start + length) return;
			const body = buffer.slice(start, start + length).toString('utf8');
			buffer = buffer.slice(start + length);
			try {
				const msg = JSON.parse(body);
				onMessage(msg);
			} catch (e) {
				console.error('[ucode-lsp] Failed to parse LSP message body', e);
			}
		}
	};
}

export function startUcodeLspBridge(options = {}) {
	const port = options.port ?? 6005;
	const workspaceRoot = options.workspaceRoot ?? resolve(process.cwd(), 'ucode-workspace');
	const workspaceUri = pathToFileURL(workspaceRoot).toString();

	const wss = new WSServer({ port });
	console.log(`[ucode-lsp] WS bridge listening on ws://localhost:${port}`);

	wss.on('connection', (socket) => {
		console.log('[ucode-lsp] client connected');

		const lspScript = resolve(process.cwd(), 'node_modules/ucode-lsp/bin/ucode-lsp.js');
		const child = spawn(process.execPath, [lspScript, '--stdio'], {
			stdio: ['pipe', 'pipe', 'pipe'],
			cwd: workspaceRoot
		});

		child.on('error', (err) => {
			console.error('[ucode-lsp] server process error:', err);
		});
		child.stderr.on('data', (d) => {
			console.error('[ucode-lsp][stderr]', d.toString());
		});

		// Child -> WS
		const onStdout = createLspStdoutParser((msg) => {
			socket.send(JSON.stringify(msg));
		});
		child.stdout.on('data', onStdout);

		// WS -> Child (augment initialize if missing root)
		socket.on('message', (data) => {
			try {
				const msg = typeof data === 'string' ? JSON.parse(data) : JSON.parse(Buffer.from(data).toString('utf8'));
				if (msg && msg.method === 'initialize' && msg.params) {
					if (!msg.params.rootUri && !msg.params.rootPath) {
						msg.params.rootUri = workspaceUri;
					}
					if (!msg.params.workspaceFolders) {
						msg.params.workspaceFolders = [{ uri: workspaceUri, name: 'ucode-workspace' }];
					}
				}
				writeLspMessage(child.stdin, msg);
			} catch (e) {
				console.error('[ucode-lsp] WS message parse error', e);
			}
		});

		socket.on('close', () => {
			try { child.kill(); } catch {}
		});
		child.on('exit', () => {
			try { socket.close(); } catch {}
		});
	});
}


