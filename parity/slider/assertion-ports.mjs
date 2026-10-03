// Preserve original declaration-site hashes separately from native supplements.
import ts from "../../packages/base/node_modules/typescript/lib/typescript.js";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
const inventory = JSON.parse(
  readFileSync(
    resolve(import.meta.dirname, "original-assertions.json"),
    "utf8",
  ),
);
const ports = [];
for (const file of inventory.files.filter((file) =>
  file.source.includes("/utils/"),
)) {
  const local = "packages/base/tests/slider-" + file.source.split("/").at(-1);
  const source = readFileSync(
    resolve(import.meta.dirname, "../..", local),
    "utf8",
  );
  const ast = ts.createSourceFile(local, source, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === "it") {
      const sha256 = createHash("sha256")
        .update(node.getText(ast))
        .digest("hex");
      const original = file.declarations.find(
        (declaration) => declaration.sha256 === sha256,
      );
      if (!original)
        throw new Error(
          `Changed original assertion body: ${local}:${ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1}`,
        );
      ports.push({
        source: file.source,
        originalLine: original.line,
        originalSha256: original.sha256,
        name: original.name,
        local,
        localLine:
          ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
        localSha256: sha256,
        kind: original.kind,
        status:
          "unchanged ordinary helper declaration body; imports only adapted",
        conformanceCredit: 0,
        parameterizedVariantCredit: 0,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (
    ports.filter((port) => port.source === file.source).length !==
    file.declarations.length
  )
    throw new Error(`Lost original helper declarations: ${file.source}`);
}
if (ports.length !== 24)
  throw new Error("Expected exactly 24 unchanged original helper declarations");
const output =
  JSON.stringify(
    {
      pin: inventory.pin,
      originalInventory: "original-assertions.json",
      ordinaryHelperDeclarations: 24,
      ordinaryComponentDeclarationCredit: 0,
      completeConformanceCredit: 0,
      nativeSupplementsOrdinaryCredit: 0,
      status:
        "Immutable helper body correspondence verified. Actual execution and independent final review receipts remain separate from original declaration inventory.",
      ports,
    },
    null,
    2,
  ) + "\n";
const destination = resolve(import.meta.dirname, "assertion-ports.json");
if (process.argv.includes("--check")) {
  if (readFileSync(destination, "utf8") !== output)
    throw new Error("Slider assertion port map stale");
} else writeFileSync(destination, output);
console.log(
  "24 unchanged Slider helper declaration bodies; zero component/conformance/native supplement credit",
);
