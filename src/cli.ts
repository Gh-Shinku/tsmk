import { promises as fs } from "node:fs";
import path from "node:path";
import { cac } from "cac";
import { stripHeadingNumbers } from "./transform";

type Options = {
  input?: string;
  output?: string;
};

async function run(inputPath: string, outputPath: string): Promise<void> {
  const markdown = await fs.readFile(inputPath, "utf8");
  const transformed = stripHeadingNumbers(markdown);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, transformed, "utf8");

  console.log(`Processed markdown: ${inputPath} -> ${outputPath}`);
}

const cli = cac("tsmk");

cli
  .command("[input] [output]", "Process markups")
  .option("-i, --input <path>", "Input file")
  .option("-o, --output <path>", "Output file")
  .action(async (inputArg?: string, outputArg?: string, options?: Options) => {
    try {
      const inputPath = options?.input ?? inputArg;
      const outputPath = options?.output ?? outputArg;

      if (!inputPath || !outputPath) {
        throw new Error("Please provide input and output file paths.");
      }

      await run(inputPath, outputPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      cli.outputHelp();
      process.exitCode = 1;
    }
  });

cli.help();

cli.parse();