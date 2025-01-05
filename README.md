# Raycast Packages

All the package in this folder are created on **React** and **Typescript** and can be installed and developed with **Node.js** version **22.7.0** and above.

## Extensions Includes
- **UX News**: A Simple News extension that fetches news using RSS Feed
- **UX Accessibility**: A AI-Powered extension that uses AI to generate comprehensive reports on any UI's accessibility
- **Finder Assistant**: A Comprehensive AI-Powered extension that uses AI to manipulate files inside any folder using **Natural Language**.

# Get Started
All the extensions are easy to run and integrate in Raycast using the steps mentioned below

Start by installing [`node`](https://nodejs.org/en/download) if not already  
### Using Homebrew
```bash
brew install node
```

If you are using ubuntu, the method to install the required version of node bit tricky,  
Follow this [article](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04#option-3-installing-node-using-the-node-version-manager) to install node@22 in ubuntu.

After installing node, clone this repository to your local machine using:  
```bash
git clone https://github.com/namanrjpt/raycast-extensions.git
```

## Appendix

- [Installation](#1-installation)
- [Integration](#2-Integration)
- [Usage](#3-usage)

## 1. Installation
After cloning, open the directory to your favorite code editor like VS Code  
`cd` to the extension directory you want to run, ex.
```bash
cd finder-assistant
```
Run
```bash
npm install
```
to install all the required files required to run the extension.

## 2. Integration

After installing everything we are good to go, but if we want to just test the extension in dev mode, we must check whether our raycast is running in development mode.  

Run your Raycast using `⌥ + space`  
Head to setting by searching `Advanced`, scroll down and see if `Open Raycast in development mode` is turned on. If not turn it on.

After that head back to your code editor and open a terminal in that directory  
### Run
```bash
npm run dev
```
**That's it** now you can open your raycast and explore the extension in `development section`

## 3. Usage
All the extensions work different and may require certain environment to work corretly, like

1. **UX News**  
    This extension scrapes news from various UX News portals like
    - Smashing Magazine
    - UX Design
    - NN Group
    It can be selected from the top right dropdown from which news protal you wish to get news.

2. **UX Accessibility (PRO)**  
    This is a rather straight forward extension, however this extension requires you to have Raycast PRO to use AI-powered features.  
    This extension supports two commands  
    - Capture Area
    - Capture Full Screen  
    Both works as the name suggests, captures your screen either according to you by selecting an area, or full screen. After capturing the screen, the AI analyses and generates a comprehensive Accessibility report covering following points  
    - Color contrast
    - Focus visibility  
    - ⁠Semantic structure  
    - Clear and descriptive links  
    - ⁠Langauge of the page  
    - ⁠Responsive and reflow  

3. **Finder Assistant (PRO)**
    This is a comprehensive extension used to manipulate files using Natural langugage by utilizing the power of NLP.  
    This is a rather straight forward extension as well, you open any folder in the finder and opens the extension by either using the shortcut that you have created or by firing Raycast using `⌥ + space`.  
    ##### After opening the extension you just type the command in Natural Language like:
    ````
    Create 10 txt files with the names of animals and 
    add 5 lines of content related to that animal
    ````

    This will create 10 `.txt` files with the names of animals and add relevant content related to that animal inside that file.

4. **Static Quotes**
    This is a simple extension that randomly selects a quote from `quotes.json` and displays it in the subtitle of the extension after the extension name.