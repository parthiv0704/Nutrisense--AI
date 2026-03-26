# 🥗 NutriSense AI - Indian AI Nutrition Coach

NutriSense AI is an autonomous, agentic web application designed for **IMPACT AI 3.0**. It acts as a personalized Indian nutrition coach that understands dietary goals, regional cuisines, and health vectors. Driven entirely by the **Gemini 2.5 Flash API**, NutriSense AI generates precise 7-day meal plans, strictly adheres to user constraints, and offers an interactive chat interface to intuitively adjust and redistribute meals based on real-world events (like skipping breakfast or eating out).

## 🚀 Features

- **Personalized Onboarding Engine**: Collects precise anthropometric data (Height, Weight, Age), diet types (Jain, Vegan, Non-Veg), and regional Indian cuisines to generate highly specific meal plans.
- **Smart Macro Breakdown**: Visually displays targeted macro distributions (Protein, Carbs, Fats) and real-time BMI.
- **Agentic Chat Adjustments (The "Coach")**: A fully interactive chat view that can intelligently rewrite your meal plan based on natural language input (e.g. *"I just had a heavy biryani lunch, adjust my dinner"*).
- **Automated Health Risk Assessment**: Analyzes the generated meal combinations against the user's base conditions in the background and surfaces localized alerts if hazardous patterns are detected.
- **Meal History Vault**: A comprehensive archive that persistently logs previously generated meal plans, enabling users to review past dietary regimens.
- **Festival Context & Dietary Adjustments**: Built-in logic seamlessly hooks into calendar dates to recognize major Indian festivals, intelligently adjusting meal suggestions to account for traditional fasting rules or culturally significant ingredients.
- **Serverless & Local-First**: Written entirely with React + Vite and deployed with zero backends. All meal plans, state progress, and chat histories are persisted fully in standard `localStorage`.

## 🛠 Tech Stack

- **React + Vite**: For blazing-fast module replacement and state handling.
- **Tailwind CSS**: For all structural and layout-based design elements.
- **Lucide React**: For sleek, scalable iconography.
- **Google Gemini 2.5 Flash API**: Powers generating meal plans strictly following defined JSON schemas, completely independent of external LLM-parsing middleware libraries.
- **Vercel**: Deployment-ready routing configurations included.

## 🏗 Project Architecture

Every component has a specific logical separation to manage the dynamic state gracefully:

1. **`App.jsx`**: The command center. It bridges the view components (`onboarding`, `mealplan`, `chat`, `history`) and ensures variables are hoisted properly and `localStorage` synchronizes on initial paints.
2. **`OnboardingForm.jsx`**: Collects user inputs, passes data through strict validation bounds, queries Gemini for the master-plan, and captures loading/error states without breaking UI flow.
3. **`MealPlanDisplay.jsx` & `NutritionBreakdown.jsx`**: Visually maps out the parsed nested JSON into horizontal scrollable grids, rendering individual meal elements dynamically and displaying drop-down cooking instructions.
4. **`ChatAdjustment.jsx`**: Preserves conversational context history and proxies natural language requests through Gemini to strategically rewrite and mutate specific arrays within the active `localStorage` meal plan without resetting the whole week.
5. **`HistoryVault.jsx` & `FestivalBanner.jsx`**: Specialized UI components that provide a historical log of cached meal plans and timely, context-aware festival dietary suggestions linked to real-world dates.
6. **`geminiApi.js`, `promptBuilder.js` & `festivalCalendar.js`**: Core utilities. `promptBuilder.js` defines stringent static schema templates for AI bounding. `festivalCalendar.js` injects date-sensitive adjustments. `geminiApi.js` features robust regex fail-safes capable of extracting native JSON objects even if the LLM hallucinates conversational syntax block paddings.

## 💻 How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A free Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### 2. Setup Guide
Clone the repository, navigate into the directory, and run the following terminal commands to install packages:

```bash
npm install
```

### 3. Environment Variable Configuration
Create a `.env` file at the root of the project to securely house your API Key. **Note: Because `.env` is listed in your `.gitignore` to keep your API keys safe, this file will not be included in the repository when you push or clone it. Anyone running this project must manually create the `.env` file and paste their own API key inside.**

It should look exactly like this:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```
*(Note: Because this is a client-side-only React app, Vite explicitly requests appending the `VITE_` prefix to any environment variables the app needs to read).*

### 4. Boot up
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser. Start designing your meal plans!

## 📲 Mobile-First Design
NutriSense AI is uniquely designed around a 375px mobile viewport paradigm (max-w-md constraint on core panels) wrapped tightly inside a dynamic horizontal desktop frame. Feel absolutely free to view and test it via Chrome DevTools Mobile View mode to experience its true layout flow!
