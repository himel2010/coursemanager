# QUIZ GENERATION - COMPREHENSIVE FIX GUIDE

## Issue Status
- **405 Error**: Route handler not being recognized
- **400 Error**: Request validation or API key issues
- **Root Cause**: Turbopack compiler bug + possible API key/model issues

---

## FIXES ALREADY APPLIED
✅ **Fix #1**: Removed duplicate Prisma models (QuizAttempt)
✅ **Fix #2**: Changed from NextResponse to native Response.json()
✅ **Fix #3**: Added extensive logging for debugging
✅ **Fix #4**: Set `dynamic = 'force-dynamic'` to prevent caching
✅ **Fix #5**: Cleared all build caches (.next, Turbopack)

---

## REMAINING FIXES TO TRY (In Order of Priority)

### IMMEDIATE - Test Current Setup (Now)
**Test #1: Direct API Call**
```bash
# Test the endpoint with curl
curl -X POST http://localhost:3001/api/quiz-generate \
  -H "Content-Type: application/json" \
  -d '{"documentContent":"This is a test document about photosynthesis","documentTitle":"Test","numQuestions":3}'
```

**Check server logs** for detailed error messages (look in terminal)

---

### IF STILL 405 ERROR - Routes Not Working

**Fix #6: Bypass Turbopack - Use regular Next.js**
- Edit `next.config.mjs`:
  ```javascript
  export default {
    experimental: {
      turbopack: false,  // Disable Turbopack, use Webpack
    },
  };
  ```

**Fix #7: Move endpoint to `/api/generate-quiz`**
- Rename folder `/api/quiz-generate` → `/api/generate-quiz`
- Update client: change `/api/quiz-generate` → `/api/generate-quiz` in QuizModal.jsx

**Fix #8: Use API route with dynamic route segment**
- Rename `route.js` → `page.js`
- Add proper segment config

---

### IF 400 ERROR - Request/Data Issues

**Fix #9: Check QWEN_API_KEY**
```bash
# Verify key is loaded:
node -e "console.log(process.env.QWEN_API_KEY)"
```

**Fix #10: Test with simplified model (free tier might be rate-limited)**
- Change model from `qwen/qwen3-coder:free` to:
  - `openai/gpt-3.5-turbo` (if your key supports it)
  - `google/palm-2-chat-bison` (alternative)

**Fix #11: Add request timeout**
```javascript
const aiResponse = await fetch(OPENROUTER_URL, {
  method: "POST",
  timeout: 30000, // 30 second timeout
  // ... rest of config
});
```

---

### ALTERNATIVE APPROACHES (If OpenRouter Fails)

**Fix #12: Use local model with Ollama**
- Install: `https://ollama.ai`
- Run: `ollama run mistral`
- Update endpoint to: `http://localhost:11434/api/generate`

**Fix #13: Use Google Generative AI (Gemini)**
```javascript
// Instead of OpenRouter, use @google/generative-ai package
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
```

**Fix #14: Use Claude via Anthropic API**
```javascript
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();
```

**Fix #15: Simplify to mock quiz (for testing)**
```javascript
// Return a hardcoded quiz instead of calling API
const mockQuiz = {
  questions: [
    {id:1, question: "Test?", options:["A","B","C","D"], correctOption:0, explanation:"Test"}
  ]
};
return Response.json({ success: true, quiz: mockQuiz });
```

---

### CLIENT-SIDE FIXES

**Fix #16: Add error handling in QuizModal.jsx**
```javascript
const quizResponse = await fetch("/api/quiz-generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({...}),
});

// Log full response
console.log("Response status:", quizResponse.status);
const responseText = await quizResponse.text();
console.log("Response body:", responseText);

if (!quizResponse.ok) {
  throw new Error(`Server error (${quizResponse.status}): ${responseText}`);
}
```

**Fix #17: Add validation before sending**
```javascript
if (!doc.id) throw new Error("Invalid document ID");
if (!content.trim()) throw new Error("Document is empty");
if (numQuestions < 1 || numQuestions > 20) throw new Error("Invalid question count");
```

---

### DATABASE/SCHEMA FIXES

**Fix #18: Verify QuizAttempt schema**
```bash
npx prisma db push  # Sync schema with database
```

**Fix #19: Create migrations**
```bash
npx prisma migrate dev --name fix_quiz_schema
```

---

### DEPLOYMENT-SPECIFIC FIXES

**Fix #20: Check environment variables in deployment**
- Ensure QWEN_API_KEY is set in your hosting environment
- Not just in local .env

**Fix #21: Add CORS headers if needed**
```javascript
export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
```

---

## TESTING CHECKLIST

- [ ] Server running on port 3001 or 3000?
- [ ] QWEN_API_KEY present in .env?
- [ ] .next directory cleared?
- [ ] Can access /api/notes endpoint (other endpoints working)?
- [ ] Curl test to /api/quiz-generate returns proper response?
- [ ] Browser console shows what error exactly?
- [ ] Server logs show anything?

---

## WHAT TO TRY NOW (Priority Order)

1. **Check server logs** - Tell me what error you see
2. **Test with curl** - Verify endpoint is reachable
3. **If 405 still**: Apply Fix #6 (disable Turbopack)
4. **If 400**: Apply Fix #9-11 (API key or model)
5. **If API fails**: Apply Fix #12-15 (alternative solutions)

---

Tell me:
1. What exact error message do you see NOW?
2. What's in the server logs?
3. Can you curl the endpoint?
