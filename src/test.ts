import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
// import fs from "fs";
// import { Sticker, createSticker, StickerTypes } from "wa-sticker-formatter";

// import mime from "mime-types";

const stickerChannel = "120363417696270115@newsletter";
const testingChannel = "120363398801923614@newsletter";

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "sessions",
  }),
});

client.on("message_create", async (message) => {
  if (message.id.fromMe) return; // Ignore messages sent by the bot itself

  // message.forward(testingChannel);

  if (message.hasMedia) {
    const media = await message.downloadMedia();

    if (media) {
      try {
        // const buffer = Buffer.from(media.data, "base64");
        // const sticker = new Sticker(buffer, {
        //   pack: "test pack",
        //   author: "xyz",
        //   type: StickerTypes.FULL, // Options: CROP, FULL
        //   quality: 100,
        // });
        // const stickerBuffer = await sticker.toBuffer();
        // const stickerMedia = new MessageMedia(
        //   "image/webp",
        //   stickerBuffer.toString("base64")
        // );
        // await client.sendMessage(message.from, stickerMedia, {
        //   sendMediaAsSticker: true,
        //   stickerAuthor: "xyz",
        //   stickerName: "test",
        // });

        // await client.sendMessage(message.from, media, {
        //   sendMediaAsSticker: true,
        //   stickerAuthor: "xyz",
        //   stickerName: "test",
        // });

        await client.sendMessage(message.from, "Hey");
        await client.sendMessage(testingChannel, "Hey");

        await client.sendMessage(message.from, media, {
          sendMediaAsSticker: true,
          stickerAuthor: "xyz",
          stickerName: "test",
        });

        await client.sendMessage(testingChannel, media, {
          sendMediaAsSticker: true,
          stickerAuthor: "xyz",
          stickerName: "test",
        });

        // console.log(res);

        console.log("Sticker sent successfully");
      } catch (err) {
        console.error("Error sending sticker:", err);
      }
    }
  }

  if (message.body === "!ping") {
    // send back "pong" to the chat the message was sent in
    client.sendMessage(message.from, "pong");
  }
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("qr", (qr: any) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();
