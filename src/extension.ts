"use strict";
import * as vscode from "vscode";
import tinify from "tinify";
import { message } from "./message";

const env = vscode.env.language as "en" | "zh-cn";
const env_message = message[env];
const compressImage = (file: any) => {
  console.log(vscode.env.language, "language");
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.text = `${env_message.compressing_tip} ${file.fsPath}...`;
  statusBarItem.show();
  return tinify.fromFile(file.fsPath).toFile(file.fsPath, error => {
    statusBarItem.hide();
    if (error) {
      if (error instanceof tinify.AccountError) {
        // Verify your API key and account limit.
        console.error(env_message.authentification_tip);
        vscode.window.showErrorMessage(env_message.authentification_tip);
      } else if (error instanceof tinify.ClientError) {
        // Check your source image and request options.
        console.error(env_message.error_tip);
        vscode.window.showErrorMessage(env_message.error_tip);
      } else if (error instanceof tinify.ServerError) {
        // Temporary issue with the Tinify API.
        console.error(env_message.api_tip);
        vscode.window.showErrorMessage(env_message.api_tip);
      } else if (error instanceof tinify.ConnectionError) {
        // A network connection error occurred.
        console.error(env_message.network_error_tip);
        vscode.window.showErrorMessage(env_message.network_error_tip);
      } else {
        // Something else went wrong, unrelated to the Tinify API.
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
      }
    } else {
      vscode.window.showInformationMessage(env_message.success_tip);
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
