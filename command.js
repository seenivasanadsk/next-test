import createBox from "./commands/helpers/createBox.js";
import createTable from "./commands/helpers/createTable.js";
import createProgress from "./commands/helpers/createProgressBar.js";

console.log(
  createBox("Hello World!\nThis is a CLI box.", {
    borderStyle: "rounded",
    borderColor: "brightMagenta",
  })
);

console.log(
  createTable(
    [
      ["Alice", "Engineering"],
      ["Bob", "Design"],
    ],
    {
      headers: ["Name", "Team"],
      headerColor: "brightGreen",
      borderStyle: "single",
    }
  )
);

async function runTasks() {
  const totalTasks = 12;
  const progress = createProgress({
    total: totalTasks,
    label: "Running Tasks:",
  });

  for (let i = 1; i <= totalTasks; i++) {
    await new Promise((r) => setTimeout(r, 100)); // simulate async work
    progress.update(i);
  }

  console.log("✅ All tasks complete!");

  console.log("\x1b[1mBold Text\x1b[0m");
  console.log("\x1b[1m\x1b[97mBright White Bold Text\x1b[0m");

}

runTasks();