import * as vscode from 'vscode';
import * as path from 'path';
import { Console } from 'console';
import * as fs from 'fs';

export async function showDeclare() {
    vscode.window.showInformationMessage('declare c/c++ function');

    const cppDiagnosticCollection =
        vscode.languages.createDiagnosticCollection('C++');
    
    /* const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = editor?.selection.active;
        const wordRange = editor?.document
            .getWordRangeAtPosition(position!);
        const word = editor?.document.getText(wordRange!);

        const peekResult : vscode.Location = await vscode.commands.executeCommand(
            'C_Cpp.PeekDeclaration', 
            editor?.document.uri.toString(), position);
        const declarationUri = peekResult.uri;
        const declarationPosition = peekResult.range.start;
        vscode.window.showInformationMessage('' + declarationPosition);

    } */

    
    
    await vscode.commands.executeCommand(
        'vscode.PeekDeclaration').then( () => {
            vscode.window.showInformationMessage('Peeked');
        }
    );

    cppDiagnosticCollection.dispose();
    return undefined;
}

export function getFile() {
    vscode.window.showInputBox({ prompt: 'Open:' }).then((inputValue) => {
        if (inputValue !== undefined) {
            // vscode.window.showInformationMessage(`You entered: ${inputValue}`);
            inputValue = inputValue.replace(/\\/g, '/');
            let sep = inputValue.lastIndexOf(':');
            let lineNumber = 1;
            if (sep < 0) {
                // -- no line number
            } else{
                lineNumber = parseInt(inputValue.substring(sep + 1));
                inputValue = inputValue.substring(0, sep);
            }

            // let curFolder = getCurrentFolder();
            // let files = findFiles(curFolder);
            // console.log("files =", files);

            let uri = vscode.Uri.file(inputValue);
            
            vscode.commands.executeCommand("vscode.open", uri).then(
                () => {
                    // console.log('line: %d', lineNumber);
                    const activeTextEditor = vscode.window.activeTextEditor;
                    if (activeTextEditor) {
                        vscode.commands.executeCommand("revealLine",
                            { lineNumber: lineNumber, at: 'center' });
                    }
                }
            );
            return inputValue;
        }
      });
}

function findFiles(fpath: string) {
    try {
        const files = fs.readdirSync(fpath);
        return files;
    } catch (err) {
        console.error('Error reading folder:', err);
        return [];
    }
}

function getCurrentFolder() {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
        return folders[0].uri.path; // Assuming the first folder is the active one. You can modify this as per your requirements.
    }
    return "./";
}