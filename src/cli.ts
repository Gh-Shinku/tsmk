import { promises as fs } from "node:fs";
import path from "node:path";
import { cac } from "cac";
import { stripHeadingNumbers, shiftHeadingLevel } from "./transform";

async function readAndWrite(
  inputPath: string,
  outputPath: string,
  transform: (markdown: string) => string,
): Promise<void> {
  const markdown = await fs.readFile(inputPath, "utf8");
  const transformed = transform(markdown);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, transformed, "utf8");
  console.log(`Processed markdown: ${inputPath} -> ${outputPath}`);
}

const cli = cac("tsmk");

cli
  .command("strip <input> <output>", "Strip numbering prefixes from headings")
  .action(async (inputPath: string, outputPath: string) => {
    try {
      await readAndWrite(inputPath, outputPath, stripHeadingNumbers);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      console.error(message);
      cli.outputHelp();
      process.exitCode = 1;
    }
  });

cli
  .command("shift <input> <output>", "Shift heading levels up or down")
  .option("-o, --offset <offset>", "Shift offset (required)")
  .action(async (inputPath: string, outputPath: string, options: { offset?: string }) => {
    try {
      if (options?.offset == null) {
        throw new Error("Option --offset is required.");
      }
      const offset = Number(options.offset);
      if (!Number.isInteger(offset)) {
        throw new Error("Offset must be an integer.");
      }
      await readAndWrite(inputPath, outputPath, (md) =>
        shiftHeadingLevel(md, offset),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      console.error(message);
      cli.outputHelp();
      process.exitCode = 1;
    }
  });

cli.help();
cli.parse();
