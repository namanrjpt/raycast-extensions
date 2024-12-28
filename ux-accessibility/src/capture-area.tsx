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
  const [inBetweenCapture, setInBetweenCapture] = useState(false);

  const captureAreaScreenshot = () => {
    if (inBetweenCapture) return;

    const tempFilePath = join(process.env.TMPDIR || "/tmp", `uic-area-ss-${new Date().getTime()}.png`);
    showHUD("Please select the area to capture...");
    setInBetweenCapture(true);
    exec(`screencapture -i ${tempFilePath}`, (err) => {
      setInBetweenCapture(false);
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

  useEffect(() => {
    // if(!environment.canAccess(AI)) {
    //   return;
    // }

    if (!inBetweenCapture) captureAreaScreenshot();
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
      const prompt = `
      STRICTLY DONT RETURN MARKUP RETURN PLAIN TEXT

      As per wcag UI accessibility standards, rate this UI seen on this image on
      the following parameters and show in requested format:
      The Image: ${uploadedImgUrl}
      
      Parameters:
      1. Color contrast
      2. Focus visibility
      3. Semantic structure
      4. Clear and descriptive links
      5. Langauge of the page
      6. Responsive and reflow

      STRICTlY keep the title of the parameters: {PARAMS}

      Format:
      {key}:{percentage_score} - {3-4 Word Comment}
      {key} will be a the first letter of words of the parameters
      {percentage_score} will be a percentage on how much the UI follows that parameter
      `;

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

      const response = await AI.ask(prompt);
      setReport(response);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Failed to analyze the image. Please try again.");
    } finally {
      clearTimeout(timeoutId);
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
        navigationTitle="Assess Area Screenshot's UI"
        metadata={
          <Detail.Metadata>
            <Detail.Metadata.Label title="Color Contrast" text={"..."} />
            <Detail.Metadata.Label title="Focus visibility" text={"..."} />
            <Detail.Metadata.Label title="Semantic structure" text={"..."} />
            <Detail.Metadata.Label title="Clear and descriptive links" text={"..."} />
            <Detail.Metadata.Label title="Language of the page" text={"..."} />
            <Detail.Metadata.Label title="Responsive and reflow" text={"..."} />
          </Detail.Metadata>
        }
      />
    );
  }

  return report ? (
    <Detail
      markdown={`![Screenshot](${imagePath})`}
      navigationTitle="Assess Area Screenshot's UI"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Color Contrast" text={report.split("C:")[1]?.split("\n")[0]?.trim()} />
          <Detail.Metadata.Label title="Focus visibility" text={report.split("F:")[1]?.split("\n")[0]?.trim()} />
          <Detail.Metadata.Label title="Semantic structure" text={report.split("S:")[1]?.split("\n")[0]?.trim()} />
          <Detail.Metadata.Label
            title="Clear and descriptive links"
            text={report.split("C:")[2]?.split("\n")[0]?.trim()}
          />
          <Detail.Metadata.Label title="Language of the page" text={report.split("L:")[1]?.split("\n")[0]?.trim()} />
          <Detail.Metadata.Label title="Responsive and reflow" text={report.split("R:")[1]?.split("\n")[0]?.trim()} />
        </Detail.Metadata>
      }
    />
  ) : null;
}
