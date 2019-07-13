"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tinify_1 = require("tinify");
const compressImage = (file) => {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = `Compressing file ${file.fsPath}...`;
    statusBarItem.show();
    return tinify_1.default.fromFile(file.fsPath).toFile(file.fsPath, error => {
        statusBarItem.hide();
        if (error) {
            if (error instanceof tinify_1.default.AccountError) {
                // Verify your API key and account limit.
                console.error("Authentification failed. Have you set the API Key?");
                vscode.window.showErrorMessage("Authentification failed. Have you set the API Key?");
            }
            else if (error instanceof tinify_1.default.ClientError) {
                // Check your source image and request options.
                console.error("Ooops, there is an error. Please check your source image and settings.");
                vscode.window.showErrorMessage("Ooops, there is an error. Please check your source image and settings.");
            }
            else if (error instanceof tinify_1.default.ServerError) {
                // Temporary issue with the Tinify API.
                console.error("TinyPNG API is currently not available.");
                vscode.window.showErrorMessage("TinyPNG API is currently not available.");
            }
            else if (error instanceof tinify_1.default.ConnectionError) {
                // A network connection error occurred.
                console.error("Network issue occurred. Please check your internet connectivity.");
                vscode.window.showErrorMessage("Network issue occurred. Please check your internet connectivity.");
            }
            else {
                // Something else went wrong, unrelated to the Tinify API.
                console.error(error.message);
                vscode.window.showErrorMessage(error.message);
            }
        }
        else {
            vscode.window.showInformationMessage(`Image ${file.fsPath} successfully compressed!`);
        }
    });
};
const validate = (onSuccess, onFailure) => tinify_1.default.validate(function (err) {
    if (err) {
        onFailure(err);
    }
    else {
        onSuccess();
    }
});
function activate(context) {
    // Get API Key
    tinify_1.default.key = vscode.workspace.getConfiguration("tinypng").get("apiKey") || "";
    // Validate user
    validate(console.log("Validation successful!"), (e) => {
        console.error(e.message);
        vscode.window.showInformationMessage("TinyPNG: API validation failed. Be sure that you filled out tinypng.apiKey setting already.");
    });
    let disposableCompressFile = vscode.commands.registerCommand("extension.compressFile", compressImage
    // () => {
    //   vscode.window.showInformationMessage("compressFile...");
    // }
    );
    context.subscriptions.push(disposableCompressFile);
    let disposableCompressFolder = vscode.commands.registerCommand("extension.compressFolder", function (folder) {
        vscode.workspace
            .findFiles(new vscode.RelativePattern(folder.path, `**/*.{png,jpg,jpeg}`))
            .then(files => files.forEach(compressImage));
    });
    context.subscriptions.push(disposableCompressFolder);
    let disposableCompressionCount = vscode.commands.registerCommand("extension.getCompressionCount", () => afterValidation(() => vscode.window.showInformationMessage(`TinyPNG: You already used ${tinify_1.default.compressionCount} compression(s) this month.`)));
    context.subscriptions.push(disposableCompressionCount);
}
exports.activate = activate;
const afterValidation = (callback) => validate(callback);
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map