import { AI, Detail, environment, showHUD } from "@raycast/api";
import screenshot from "screenshot-desktop";
import React, { useState, useEffect } from "react";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { exec } from "child_process";
import { uploadToCloudinary } from "./utils";

process.env.PATH = "/usr/sbin:/usr/bin:/bin:/usr/local/bin";

export default function CaptureFullScreenCommand() {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  useEffect(() => {
    // if(!environment.canAccess(AI)) {
    //   return;
    // }
    const captureScreenshot = async () => {
      try {
        showHUD("Capturing Screenshot...");
        const imgBuffer = await screenshot({ format: "png" });
        const filePath = join(process.env.TMPDIR || "/tmp", `uic-fs-ss-${new Date().getTime()}.png`);
        writeFileSync(filePath, imgBuffer);

        setImagePath(`file://${filePath}`);
        exec("open -a Raycast");
        analyzeImage(filePath);
      } catch (err) {
        console.error("Error capturing screenshot:", err);
        setError("Failed to capture the screenshot. Please check your macOS environment.");
      }
    };

    captureScreenshot();
  }, []);

  const readFile = (filePath: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const fs = require("fs");
      fs.readFile(filePath, (err: any, data: Buffer | PromiseLike<Buffer>) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  };

  const analyzeImage = async (imagePath: string) => {
    try {
      // Read the image file
      const imageData = await readFile(imagePath);
      const uploadedImgUrl = await uploadToCloudinary(imageData)

      // Create the prompt for Gemini
      const prompt = `Analyze the following image for accessibility issues: 
      [Image URL: ${uploadedImgUrl}] 

      Provide a report with the following sections:
      - **Text Content:** 
          - Readability 
          - Issues (e.g., font size, color contrast, language)
      - **Contrast:**
          - Issues (e.g., insufficient color contrast between text and background)
      - **Missing Alt Text:**
          - List of elements missing alt text
      - **Visual Elements:**
          - Issues (e.g., excessive animations, moving elements, flickering)`;

      const response = await AI.ask(prompt, {
        model: "anthropic-claude-opus"
      });
      setReport(response);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Failed to analyze the image. Please try again.");
    }
  };

  if (!environment.canAccess(AI)) {
    return <Detail markdown={`This extension is only available for **Raycast PRO** users.`} />;
  }

  if (error) {
    return <Detail markdown={`**Error:** ${error}`} />;
  }

  if (!imagePath) {
    return <Detail markdown="Capturing area screenshot, please select an area..." />;
  }

  if (!report && !error) {
    return <Detail markdown={`AI is generating the Accessibility Report...`} />;
  }

  return (
    <Detail
      markdown={`![Screenshot](${imagePath})`}
      navigationTitle="Assess Full Screenshot's UI"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Report" text={report!} />
        </Detail.Metadata>
      }
    />
  );
}
