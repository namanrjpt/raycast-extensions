import { Detail, showHUD, environment, AI } from "@raycast/api";
import { exec } from "child_process";
import { useState, useEffect } from "react";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "./utils";

process.env.PATH = "/usr/sbin:/usr/bin:/bin:/usr/local/bin";

export default function CaptureAreaCommand() {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loadingTexts, setLoadingTexts] = useState([
    "AI is Optimizing the Screenshot...",
    "AI is analysing the UI...",
    "AI is generating the accessibility report...",
    "Almost done...",
  ]);

  const [currentLoadingText, setCurrentLoadingText] = useState(0);

  useEffect(() => {
    // if(!environment.canAccess(AI)) {
    //   return;
    // }
    const captureAreaScreenshot = () => {
      const tempFilePath = join(process.env.TMPDIR || "/tmp", `uic-area-ss-${new Date().getTime()}.png`);
      // Use `screencapture` with `-i` for interactive area selection
      showHUD("Please select the area to capture...");
      exec(`screencapture -i ${tempFilePath}`, (err) => {
        if (err) {
          console.error("Error capturing screenshot:", err);
          setError("Failed to capture the screenshot. Please try again.");
          return;
        }

        setImagePath(`file://${tempFilePath}`);
        exec("open -a Raycast");
        analyzeImage(tempFilePath);
      });
    };

    captureAreaScreenshot();
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
    const timeoutId = setTimeout(() => {
      setCurrentLoadingText(currentLoadingText + 1 < loadingTexts.length ? currentLoadingText + 1 : currentLoadingText);
    }, 600);
    try {
      // Read the image file
      const imageData = await readFile(imagePath);
      const uploadedImgUrl = await uploadToCloudinary(imageData);
      const imageBase64 = Buffer.from(imageData).toString("base64");
      console.log(uploadedImgUrl);

      // Create the prompt for Gemini
      const prompt = `Analyze the following image for accessibility issues: 
      [Image located at: ${uploadedImgUrl}]

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

      // const prompt = `Analyze the following image for accessibility issues: 
      // [Image: data:image/png;base64,${imageBase64}]

      // Provide a report with the following sections:
      // - **Text Content:** 
      //     - Readability 
      //     - Issues (e.g., font size, color contrast, language)
      // - **Contrast:**
      //     - Issues (e.g., insufficient color contrast between text and background)
      // - **Missing Alt Text:**
      //     - List of elements missing alt text
      // - **Visual Elements:**
      //     - Issues (e.g., excessive animations, moving elements, flickering)`;

      const response = await AI.ask(prompt, {
        model: "anthropic-claude-opus",
      });
      setReport(response);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Failed to analyze the image. Please try again.");
    } finally {
      clearTimeout(timeoutId)
    }
  };

  if (!environment.canAccess(AI)) {
    return <Detail markdown={`This extension is only available for **Raycast PRO** users.`} />;
  }

  if (error) {
    return <Detail markdown={`**Error:** ${error}`} />;
  }

  if (!imagePath) {
    return <Detail isLoading markdown="Capturing area screenshot, please select an area..." />;
  }

  if (!report && !error) {
    return (
      <Detail
        isLoading
        markdown={loadingTexts[currentLoadingText]}
        navigationTitle="Assess Full Screenshot's UI"
        metadata={
          <Detail.Metadata>
            <Detail.Metadata.Label title="Report" text={"..."} />
          </Detail.Metadata>
        }
      />
    );
  }

  return (
    <Detail
      markdown={`![Screenshot](${imagePath}?raycast-height=400)\n\n${report!}`}
      navigationTitle="Assess Full Screenshot's UI"
    />
  );
}
