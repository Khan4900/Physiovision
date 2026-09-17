import { supabase } from "../supabaseClient";

/**
 * Call the Supabase Edge Function to generate program using LLM
 * The Edge Function supports OpenAI, Groq, and Gemini providers
 * configured via LLM_PROVIDER environment variable in Supabase secrets
 */
export const generateProgramObjectFromPrompt = async (prompt) => {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt is required and must be a string");
  }

  try {
    console.log("[Physiovision] Calling generate-program Edge Function...");
    
    const { data, error } = await supabase.functions.invoke("generate-program", {
      body: { prompt },
    });

    if (error) {
      console.error("[Physiovision] Edge function error:", error);
      throw new Error(error.message || "Failed to call generate-program function");
    }

    if (!data?.content) {
      console.error("[Physiovision] Edge function returned no content:", data);
      throw new Error("Edge function returned empty content");
    }

    console.log("[Physiovision] LLM Provider used:", data.provider || "unknown");
    
    // Parse the LLM response content into a valid JSON object
    const parsedContent = parseLLMResponse(data.content);
    
    return parsedContent;
  } catch (error) {
    console.error("[Physiovision] Error in generateProgramObjectFromPrompt:", error);
    throw error;
  }
};

/**
 * Parse the LLM response content into a valid JSON object
 * Handles markdown code blocks and other formatting
 */
const parseLLMResponse = (content) => {
  if (!content || typeof content !== "string") {
    throw new Error("Invalid LLM response content");
  }

  let cleanContent = content.trim();

  // Remove markdown code blocks if present
  if (cleanContent.startsWith("```json")) {
    cleanContent = cleanContent.slice(7);
  } else if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.slice(3);
  }
  if (cleanContent.endsWith("```")) {
    cleanContent = cleanContent.slice(0, -3);
  }

  cleanContent = cleanContent.trim();

  try {
    const parsed = JSON.parse(cleanContent);
    console.log("[Physiovision] Successfully parsed LLM response");
    return parsed;
  } catch (parseError) {
    console.error("[Physiovision] Failed to parse LLM response:", parseError);
    console.error("[Physiovision] Raw content:", cleanContent.substring(0, 500));
    throw new Error("Failed to parse LLM response as JSON: " + parseError.message);
  }
};