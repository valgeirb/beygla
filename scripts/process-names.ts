import path from "path";
import fs from "fs";
import zlib from "zlib";
import { createAndPopulateTrie } from "../src/compress/trie/createTrie";
import { serializeTrie } from "../src/compress/trie/serialize";
import { deserializeTrie } from "../src/read/deserialize";

const filePath = path.resolve(__dirname, "../out/grouped-names.json");
const outFile = path.resolve(__dirname, "../out/trie.json");
const serializedFile = path.resolve(__dirname, "../out/trie-ser.txt");
const deserializedFile = path.resolve(__dirname, "../out/trie-deser.json");

async function main() {
  const names: string[][] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const trie = createAndPopulateTrie(names);

  fs.writeFileSync(outFile, JSON.stringify(trie), "utf-8");

  const serialized = serializeTrie(trie.getTrie());
  fs.writeFileSync(serializedFile, serialized, "utf-8");
  fs.writeFileSync(
    deserializedFile,
    JSON.stringify(deserializeTrie(serialized)),
    "utf-8"
  );

  function gzip(filePath: string) {
    const stream = fs.createReadStream(filePath);
    stream
      .pipe(zlib.createGzip())
      .pipe(fs.createWriteStream(filePath + ".gz"))
      .on("finish", () => {
        const beforeZip = fs.statSync(filePath);
        const afterZip = fs.statSync(filePath + ".gz");

        const ratio = ((afterZip.size / beforeZip.size) * 100).toFixed(2);

        const parts = filePath.split("/");
        const fileName = parts[parts.length - 1];

        console.log(
          `Compressed '${fileName}' into a '.gz' file that is ${ratio}% of the original size`
        );
      });
  }

  gzip(outFile);
  gzip(serializedFile);
}

main();
