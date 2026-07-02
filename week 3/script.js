import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post("/plan", async (req, res) => {
  const goal = req.body.goal;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Break down the following goal into a step by step task list: ${goal}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            tasks: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  task_name: { type: "STRING" },
                  priority: { type: "STRING" },
                  estimated_time: { type: "STRING" }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Could not generate plan, please try again" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
