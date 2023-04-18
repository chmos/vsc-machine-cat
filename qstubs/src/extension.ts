// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
// import * as dmp from 'diff-match-patch';

// generate a file with the selected 
// path1: string
function sendSelectedToFile(filePath: string) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const document = editor.document;
		const selection = editor.selection;

		const fileName = document.fileName;
		// const selectedText = document.getText(selection);
		const startLine = selection.start.line + 1;
		const endLine = selection.end.line + 1;
		// vscode.window.showInformationMessage(
		//	`Selected lines: ${startLine}-${endLine}`);

		const start = document.lineAt(startLine - 1).range.start;
        const end = document.lineAt(endLine - 1).range.end;
		const range = new vscode.Range(start, end);
		const selectedText = document.getText(range);

		// let filePath = '/tmp/stub1.cpp';
		let text = '// -- ' + fileName + '\n' 
			+ '// -- Ln ' + startLine + ' - ' + endLine + '\n\n'
			+ selectedText + '\n';

		// -- copied to clipboard
		vscode.env.clipboard.writeText(text);

		// -- open and select all
		openAndSelectAll(filePath, text);		
	}
}

function write2file(filePath: string, text: string) {
	fs.writeFile(filePath, text, (err) => {
		if (err) {
		  vscode.window.showErrorMessage(`Failed to write to file: ${err.message}`);
		} else {
		  vscode.window.showInformationMessage('Text written to file');
		}
	  });
}

function selectAllandPaste(uri: string, text: string) {
	vscode.workspace.openTextDocument(uri).then((document) => {
		vscode.window.showTextDocument(document).then((editor) => {
			const range = new vscode.Range(0, 0,
				document.lineCount - 1,
				document.lineAt(document.lineCount - 1).text.length);
			editor.selection = new vscode.Selection(
				range.start, range.end);

			// -- now paste the text
			// const position = editor.selection.active;
			editor.edit((editBuilder) => {
				editBuilder.replace(editor.selection, text);
			});

			// if (editor.document.isDirty) {
			//	editor.document.save();
			// }
		});
	});
}

// open a file and select all its content
// and then paste the text
function openAndSelectAll(uri: string, text: string) {
	// -- if it does not exist, create it first
	const filePath = vscode.Uri.file(uri);
	if (fs.existsSync(uri)) {
		// File exists in path
		selectAllandPaste(uri, text);
	} else{
		vscode.window.showInformationMessage(
			`File ${uri} does not exist, creating`);
		fs.writeFile(uri, '', () => {
			selectAllandPaste(uri, text);
		});
	}
}

function sendSelected() {
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		let selection = editor.selection;
		// let nextPosition = editor.document.positionAt
		//	(editor.document.getText().indexOf('your keyword', editor.document.offsetAt(selection.active) + 1));
		// editor.selection = new vscode.Selection(
		// 	nextPosition, nextPosition);
		// editor.revealRange(editor.selection);

		const selectedText = editor.document.getText(editor.selection);
		console.log(selectedText);
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('The extension "rearch is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable1 = vscode.commands.registerCommand('hmi.welcome', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from VS Code!');
	});

	let disposable2 = vscode.commands.registerCommand('hmi.stub1',
		() => {
			sendSelectedToFile("/tmp/stub1.cpp");
		});

	/* let disposable3 = vscode.commands.registerCommand('hmi.goNext', () =>{
		sendSelected();
	}); */

	let disposable3 = vscode.commands.registerCommand('hmi.stub2',
		() => {
			sendSelectedToFile("/tmp/stub2.cpp");
		});

	let disposable4 = vscode.commands.registerCommand('hmi.stub_comp',
		() => {
			let uri1 = vscode.Uri.file('/tmp/stub1.cpp');
			let uri2 = vscode.Uri.file('/tmp/stub2.cpp');
			vscode.commands.executeCommand('vscode.diff',
				uri1, uri2);
		});
	
	context.subscriptions.push(disposable1, disposable2,
		disposable3, disposable4);

	let menuDisposable = vscode.commands.registerCommand(
		'editor.action.showContextMenu', () => {
			vscode.commands.executeCommand('hmi.stub1');
			vscode.commands.executeCommand('hmi.stub2');
			vscode.commands.executeCommand('hmi.stub_comp');
	});
	
	context.subscriptions.push(menuDisposable);

	/* vscode.window.onDidChangeTextEditorSelection(event => {
		if (event.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
			vscode.commands.executeCommand(
				'editor.action.showContextMenu');
		}
	}); */
}

// This method is called when your extension is deactivated
export function deactivate() {}
 