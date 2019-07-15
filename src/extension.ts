"use strict";
import * as vscode from "vscode";
import tinify from "tinify";

const compressImage = (file: any) => {
  console.log(vscode.env.language, 'language');
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.text = `Compressing file ${file.fsPath}...`;
  statusBarItem.show();
  return tinify.fromFile(file.fsPath).toFile(file.fsPath, error => {
    statusBarItem.hide();
    if (error) {
      if (error instanceof tinify.AccountError) {
        // Verify your API key and account limit.
        console.error("Authentification failed. Have you set the API Key?");
        vscode.window.showErrorMessage(
          "Authentification failed. Have you set the API Key?"
        );
      } else if (error instanceof tinify.ClientError) {
        // Check your source image and request options.
        console.error(
          "Ooops, there is an error. Please check your source image and settings."
        );
        vscode.window.showErrorMessage(
          "Ooops, there is an error. Please check your source image and settings."
        );
      } else if (error instanceof tinify.ServerError) {
        // Temporary issue with the Tinify API.
        console.error("TinyPNG API is currently not available.");
        vscode.window.showErrorMessage(
          "TinyPNG API is currently not available."
        );
      } else if (error instanceof tinify.ConnectionError) {
        // A network connection error occurred.
        console.error(
          "Network issue occurred. Please check your internet connectivity."
        );
        vscode.window.showErrorMessage(
          "Network issue occurred. Please check your internet connectivity."
        );
      } else {
        // Something else went wrong, unrelated to the Tinify API.
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
      }
    } else {
      vscode.window.showInformationMessage(
        `Image ${file.fsPath} successfully compressed!`
      );
    }
  });
};

const validate = (onSuccess: any, onFailure?: any) =>
  tinify.validate(function(err) {
    if (err) {
      onFailure(err);
    } else {
      onSuccess();
    }
  });

export function activate(context: vscode.ExtensionContext) {
  // Get API Key
  tinify.key = vscode.workspace.getConfiguration("tinypng").get("apiKey") || "";
  // Validate user
  validate(console.log("Validation successful!"), (e: any) => {
    console.error(e.message);
    vscode.window.showInformationMessage(
      "TinyPNG: API validation failed. Be sure that you filled out tinypng.apiKey setting already."
    );
  });

  let disposableCompressFile = vscode.commands.registerCommand(
    "extension.compressFile",
    compressImage
    // () => {
    //   vscode.window.showInformationMessage("compressFile...");
    // }
  );
  context.subscriptions.push(disposableCompressFile);

  let disposableCompressFolder = vscode.commands.registerCommand(
    "extension.compressFolder",
    function(folder) {
      vscode.workspace
        .findFiles(
          new vscode.RelativePattern(folder.path, `**/*.{png,jpg,jpeg}`)
        )
        .then(files => files.forEach(compressImage));
    }
  );

  context.subscriptions.push(disposableCompressFolder);

  let disposableCompressionCount = vscode.commands.registerCommand(
    "extension.getCompressionCount",
    () =>
      afterValidation(() =>
        vscode.window.showInformationMessage(
          `TinyPNG: You already used ${
            tinify.compressionCount
          } compression(s) this month.`
        )
      )
  );
  context.subscriptions.push(disposableCompressionCount);
}
const afterValidation = (callback: any) => validate(callback);
export function deactivate() {}
