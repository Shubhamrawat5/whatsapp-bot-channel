import { Client, RemoteAuth } from "whatsapp-web.js";
// import qrcode from "qrcode-terminal";
import qrcode from "qrcode";
import { MongoStore } from "wwebjs-mongo";
import mongoose from "mongoose";
import express, { Express, Request, Response } from "express";
import "dotenv/config";

const stickerChannel = "120363417696270115@newsletter";
const testingChannel = "120363398801923614@newsletter";
const stickeronly1 = "919557666582-1628610549@g.us";
const stickeronly2 = "919557666582-1586018947@g.us";
const testingGroup = "120363303907535182@g.us";

let qrCode: string | undefined;

const app: Express = express();
const port = process.env.PORT || 80;

app.get("/", (req: Request, res: Response) => {
  console.log("Get request to /");
  res.end("Web-server running!");
});

app.get("/connect", async (req: Request, res: Response) => {
  console.log("Get request to /connect");

  if (qrCode) {
    res.setHeader("content-type", "image/png");
    res.end(await qrcode.toBuffer(qrCode));
  } else {
    res.end(
      "An issue has been encountered while generating the QR code. Please keep refreshing the page to display a new QR code."
    );
  }
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
      puppeteer: {
        args: ["--no-sandbox"],
      },
    });

    client.initialize();

    client.on("message_create", async (message) => {
      if (message.id.fromMe) return; // Ignore messages sent by the bot itself

      // console.log("Message received:", message);

      if (
        message.hasMedia &&
        message.type === "sticker" &&
        (message.from === stickeronly1 || message.from === testingGroup)
      ) {
        const media = await message.downloadMedia();

        if (media) {
          try {
            await client.sendMessage(stickerChannel, media, {
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

      if (message.body === "#ping") {
        client.sendMessage(message.from, "pong");
      }
    });

    client.on("ready", () => {
      console.log("Client is ready!");
    });

    client.on("qr", (qr) => {
      console.log("QR RECEIVED, open /connect");
      // qrcode.generate(qr, { small: true });
      qrCode = qr;
    });

    client.on("remote_session_saved", () => {
      console.log("Session saved!");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
