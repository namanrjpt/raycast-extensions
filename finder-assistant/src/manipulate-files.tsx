import { ActionPanel, Action, List, showToast, Toast, AI } from "@raycast/api";
import { useEffect, useState } from "react";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

async function getCurrentlyOpenedFinderFolder(): Promise<string | null> {
  try {
    const { stdout } = await execPromise(
      "osascript -e 'tell application \"Finder\" to get POSIX path of (target of front window as alias)'",
    );
    return stdout.trim();
  } catch (error) {
    console.error("Error fetching Finder folder:", error);
    return null;
  }
}

export default function Command() {
  const [searchText, setSearchText] = useState<string>("");
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function executeCommandOnFolder(folderPath: string, command: string) {
    if (command.length <= 0) return;
    try {
      const { stdout } = await execPromise(`cd "${folderPath}" && ${command}`);
      return stdout.trim();
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }

  const updateFolderPath = async () => {
    setLoading(true);
    const path = await getCurrentlyOpenedFinderFolder();
    setFolderPath(path);
    setLoading(false);
  };

  useEffect(() => {
    updateFolderPath();
  }, []);

  const handleExecute = async (prompt?: string, output?: string) => {
    if (!folderPath) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No folder selected in Finder",
      });
      return;
    }

    if (searchText.length <= 0) {
      return await showToast({
        style: Toast.Style.Failure,
        title: "Please enter a command...",
      });
    }

    try {
      setLoading(true);
      await showToast({
        style: Toast.Style.Animated,
        title: "Executing command...",
      });

      // const thisPrompt = `
      //   You are a expert MacOS terminal user
      //   You are inside a directory and all the command will work on that directory's file and folder only
      //   Genrate a command that: ${searchText}
      //   if a single command cannot be generated and needs further data, generate a command to get that data and respond only with
      //   next:<command>,<prompt>
      //   <command> will be command that needs to be executed to get the result
      //   <prompt> will be the next prompt given to AI model
      //   if the query can result in a complete command respond with:
      //   success:<command>
      //   else respond with:
      //   failed:<reason>
      // `

      const thisPrompt = `
        You are a expert MacOS terminal user
        You will only respond with command for MacOS
        You will assume that we are in a folder and generate a command that achieves the following: ${searchText}
        ${output ? `This is a follow up command with previous command\n${prompt}, and its output:\n${output}` : ""}
        \n
        You are not limited to only providing one command, seperate them with && to chain commands to achieve the result
        if the query can result in a proper command respond with:
        success:{command}
        ${
          output
            ? ""
            : "if the query needs further data that can be generated using another command, respond with: next:{single command that gets the output needed}"
        }
        else respond with:
        failed:{reason}
      `;

      const command = await AI.ask(thisPrompt, {
        creativity: 1.5,
      });

      if (command.startsWith("next:")) {
        const output = await executeCommandOnFolder(folderPath, command.split("next:")[1]);
        if(output)
          return handleExecute(command.split("next:")[1], output)
        else throw Error("Error executing command!")
      } else if (command.startsWith("success:")) {
        await executeCommandOnFolder(folderPath, command.split("success:")[1]);
        await showToast({
          style: Toast.Style.Success,
          title: "Command executed successfully",
        });
      } else {
        console.log(command.split("failure:"));
        await showToast({
          style: Toast.Style.Failure,
          title: "Command failed",
          message: command.split("failure:")[1],
        });
      }
      setLoading(false);
    } catch (error: any) {
      console.log(error);

      await showToast({
        style: Toast.Style.Failure,
        title: "Command execution failed",
        message: error.message,
      });
    }
  };

  return (
    <List
      isLoading={loading}
      onSearchTextChange={setSearchText}
      navigationTitle="Manipulate Files"
      searchBarPlaceholder="Enter your command..."
    >
      {folderPath ? (
        <List.Item
          title="Give prompt for current folder"
          subtitle={folderPath}
          actions={
            <ActionPanel>
              <Action title="Execute" onAction={() => handleExecute()} />
              <Action title="Reload" onAction={updateFolderPath} />
            </ActionPanel>
          }
        />
      ) : (
        <List.Item title="Loading current folder..." />
      )}
    </List>
  );
}
