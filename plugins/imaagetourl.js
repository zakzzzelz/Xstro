import { bot } from "../lib/plugins.js";  
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import pkg from "file-type";
import { loadMessage } from './sql/store.js';
import { numtoId } from '../lib/utils.js';
import { smsg } from '../lib/message.js';


const { fileTypeFromBuffer } = pkg;

bot(
  {
    pattern: "upload",
    alias: ["url", "tourl", "geturl"],
    desc: "Upload files and get a shareable URL.",
    type: "utility",
  },
  async (message) => {
    try {
      if (!message.reply_message) {
        return await message.send(
          "_Reply to an image, video, audio, or document to upload._"
        );
      }

      const mediaBuffer = await message.reply_message.download();
      if (!mediaBuffer) {
        return await message.send("Failed to download media. Please try again.");
      }

      const fileType = await fileTypeFromBuffer(mediaBuffer);
      console.log("File type:", fileType); // Log the detected file type
      if (!fileType) {
        return await message.send("Unable to determine the file type of the media.");
      }

      const filename = `file.${fileType.ext}`;
      const tempFilePath = path.join(process.cwd(), filename);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      const form = new FormData();
      form.append("fileToUpload", fs.createReadStream(tempFilePath), {
        filename: filename,
        contentType: fileType.mime,
      });
      form.append("reqtype", "fileupload");

      // Log the form data before sending
      console.log("Sending data to API...");

      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const url = await response.text();
      console.log("Received URL:", url); // Log the URL returned by the API

      const stats = fs.statSync(tempFilePath);
      const fileSizeMB = stats.size / (1024 * 1024);

      const uploadMessage = `_Here is your media URL:_\n${url}\n\n` +
        `*File Size:* ${fileSizeMB.toFixed(2)} MB\n` +
        `*File Type:* ${fileType.ext.toUpperCase()}\n` +
        `_File Expiration:* No Expiry_`;

      if (fileType.mime.startsWith("image/") || fileType.mime.startsWith("video/")) {
        await message.client.sendMessage(message.chat, {
          [fileType.mime.startsWith("image/") ? "image" : "video"]: {
            url: tempFilePath,
          },
          caption: uploadMessage,
        });
      } else {
        await message.send(uploadMessage);
      }

      fs.unlinkSync(tempFilePath);

      await message.react("✅");
    } catch (error) {
      console.error("Error during file upload:", error);
      await message.send("An error occurred. Please try again.");
    }
  }
);
