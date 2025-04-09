import { Client, RemoteAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { MongoStore } from "wwebjs-mongo";
import mongoose from "mongoose";
import express, { Express, Request, Response } from "express";
import "dotenv/config";

const stickerChannel = "120363417696270115@newsletter";
const testingChannel = "120363398801923614@newsletter";

const app: Express = express();
const port = process.env.PORT || 80;

app.get("/", (req: Request, res: Response) => {
  console.log("Get request to /");
  res.end("Web-server running!");
});

app.listen(port, () => {
  console.log("\nWeb-server running!");
});

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000,
      }),
    });

    client.initialize();

    client.on("message_create", async (message) => {
      if (message.id.fromMe) return; // Ignore messages sent by the bot itself

      if (message.hasMedia) {
        const media = await message.downloadMedia();

        if (media) {
          try {
            await client.sendMessage(testingChannel, media, {
              sendMediaAsSticker: true,
              stickerAuthor: "xyz",
              stickerName: "test",
            });

            console.log("Sticker sent successfully");
          } catch (err) {
            console.error("Error sending sticker:", err);
          }
        }
      }

      if (message.body === "!ping") {
        client.sendMessage(message.from, "pong");
      }
    });

    client.on("ready", () => {
      console.log("Client is ready!");
    });

    client.on("qr", (qr: any) => {
      qrcode.generate(qr, { small: true });
    });

    client.on("remote_session_saved", () => {
      console.log("Session saved!");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
