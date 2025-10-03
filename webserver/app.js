import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { exec } from 'child_process';
import { writeFileSync } from 'fs';
import { readdir, readFile, writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

let counter = 0;
let exampleFiles = [];

// Create directories if they don't exist
const ensureDirectories = async () => {
	const dirs = ['./LoxPrograms', './LoxExamplePrograms'];
	for (const dir of dirs) {
		if (!existsSync(dir)) {
			try {
				await mkdir(dir);
				console.log(`Created directory: ${dir}`);
			} catch (err) {
				console.error(`Error creating directory ${dir}:`, err);
			}
		}
	}
};

// Ensure directories exist before starting
await ensureDirectories();

// Initialize counter and example files
try {
	const files = await readdir('./LoxPrograms');
	counter = files.length;
	
} catch (err) {
	console.error('Error reading LoxPrograms:', err);
}

try {
	exampleFiles = await readdir('./LoxExamplePrograms');
} catch (err) {
	console.error('Error reading LoxExamplePrograms:', err);
}

const app = new Elysia()
	.use(cors())
	.use(staticPlugin({
		prefix: '/',
		assets: 'public'
	}))
	.get('/loxExamples', () => {
		if (exampleFiles?.length) {
			return exampleFiles.map(file => 
				file.replace(/_/g, ' ').replace(/(\.lox)/g, '')
			);
		}
		return [];
	})
	.post('/loxExamples/:exampleProgram', async ({ params }) => {
		const exampleProgram = parseInt(params.exampleProgram);
		
		try {
			const data = await readFile(
				join('./LoxExamplePrograms', exampleFiles[exampleProgram]), 
				'utf8'
			);
			return data;
		} catch (err) {
			return { error: err.message };
		}
	})
	.post('/loxOutput', async ({ body }) => {
		if (!body || typeof body.text !== 'string') {
			return { error: 'Invalid input' };
		}

		if (body.text.length > 10000) {
			return 'Cannot send more than 10k characters.';
		}

		const threadSafeCounter = counter++;
		const location = './LoxPrograms/lox' + threadSafeCounter + '.lox';
		const execute = 'dotnet Lox.dll ' + location + ' timeout=5';

		try {
			//await writeFile(location, body.text);
			writeFileSync(location, body.text);
			console.log("wrote file", location, body.text);
			console.log("executing command:", execute);
			
			return new Promise((resolve) => {
				exec(execute, { cwd: process.cwd() }, (err, stdout, stderr) => {
					console.log("exec error:", err);
					console.log("exec stderr:", stderr);
					console.log("exec stdout:", stdout);
					
					if (err) {
						console.error("Execution error:", err);
						resolve({ error: err.message });
						return;
					}
					
					const output = stdout.toString();
					console.log("output:", output);
					
					unlink(location).catch(err => 
						console.error('Error deleting file:', err)
					);
					
					resolve(output || stderr.toString() || 'No output');
				});
			});
		} catch (error) {
			console.error("Caught error:", error);
			return { error: error.message };
		}
	})
	.listen(process.env.PORT || 5001);

console.log(
	`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);

export { app };
