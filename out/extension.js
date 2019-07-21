"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tinify_1 = require("tinify");
const message_1 = require("./message");
const env = vscode.env.language;
const env_message = message_1.message[env];
const compressImage = (file) => {
    console.log(vscode.env.language, "language");
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = `${env_message.compressing_tip} ${file.fsPath}...`;
    statusBarItem.show();
    return tinify_1.default.fromFile(file.fsPath).toFile(file.fsPath, error => {
        statusBarItem.hide();
        if (error) {
            if (error instanceof tinify_1.default.AccountError) {
                // Verify your API key and account limit.
                console.error(env_message.authentification_tip);
                vscode.window.showErrorMessage(env_message.authentification_tip);
            }
            else if (error instanceof tinify_1.default.ClientError) {
                // Check your source image and request options.
                console.error(env_message.error_tip);
                vscode.window.showErrorMessage(env_message.error_tip);
            }
            else if (error instanceof tinify_1.default.ServerError) {
                // Temporary issue with the Tinify API.
                console.error(env_message.api_tip);
                vscode.window.showErrorMessage(env_message.api_tip);
            }
            else if (error instanceof tinify_1.default.ConnectionError) {
                // A network connection error occurred.
                console.error(env_message.network_error_tip);
                vscode.window.showErrorMessage(env_message.network_error_tip);
            }
            else {
                // Something else went wrong, unrelated to the Tinify API.
                console.error(error.message);
                vscode.window.showErrorMessage(error.message);
            }
        }
        else {
            vscode.window.showInformationMessage(env_message.success_tip);
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