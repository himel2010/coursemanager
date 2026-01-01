# AI Quiz Taker - Quick Start Guide

## 🎯 What You Can Do

Generate unlimited quizzes from your study documents and get AI-powered feedback on your answers.

## 🚀 Quick Start (3 Steps)

### Step 1: Go to Notes
- Navigate to `/notes` page
- You'll see all your uploaded documents and notes

### Step 2: Click "Generate Quiz"
- New button in top right of Notes page
- Opens the Quiz Modal

### Step 3: Select & Customize
```
┌─────────────────────────────────┐
│  Generate Quiz                  │
├─────────────────────────────────┤
│  Select a Document              │
│  □ Document 1 (PDF)             │
│  □ Document 2 (Text)            │
│  □ Document 3 (Notes)           │
│                                 │
│  Number of Questions: [5 ──●─ 30]│
│                                 │
│  Click any document to start    │
└─────────────────────────────────┘
```

## 📚 Taking a Quiz

### Question View
```
┌─────────────────────────────────┐
│  Question 5 of 10               │
│  [████████░░░░░░░░] 50%         │
├─────────────────────────────────┤
│  What is the main topic here?   │
│                                 │
│  ○ Option A                     │
│  ○ Option B                     │
│  ◉ Option C (Selected)          │
│  ○ Option D                     │
│                                 │
│  [Previous] [Check Answer] [Next]│
└─────────────────────────────────┘
```

### After Checking Answer
```
┌─────────────────────────────────┐
│  ✓ Correct!                     │
│                                 │
│  Your answer: Option C          │
│  Score: 100/100                 │
│                                 │
│  Feedback:                      │
│  "This is the correct answer    │
│   because..."                   │
└─────────────────────────────────┘
```

## 📊 Results Page

### Quiz Summary
```
┌─────────────────────────────────┐
│     Your Score: 85%             │
├─────────────────────────────────┤
│  ✓ Correct: 8     ✓ Evaluated: 10
│                                 │
│  Questions Breakdown:           │
│  Q1: ✓ Correct (95/100)         │
│  Q2: ✗ Incorrect (60/100)       │
│  Q3: ✓ Correct (100/100)        │
│  ...                            │
│                                 │
│  [Retake]  [Download]  [Back]   │
└─────────────────────────────────┘
```

## 💡 Features

### 1. **Instant Feedback**
- AI immediately evaluates your answer
- See feedback before moving to next question
- Score displayed for each answer

### 2. **Navigation**
- Move between questions freely
- See progress bar
- Answer counter shows progress

### 3. **Results**
- Comprehensive breakdown
- All feedback in one place
- Download as JSON file

### 4. **Retake**
- Reset all answers
- Generate new quiz from same document
- Track improvement over time

## 🎓 Learning Tips

1. **Start with Smaller Quizzes**
   - Begin with 5-10 questions
   - Understand your weak areas
   - Gradually increase difficulty

2. **Read Feedback Carefully**
   - AI provides detailed explanations
   - Learn why answers are correct/incorrect
   - Use feedback to study better

3. **Retake for Mastery**
   - Each retake generates different questions
   - Track your score improvement
   - Focus on topics you struggle with

4. **Mix Document Types**
   - PDFs (uploaded)
   - Text notes
   - Created documents
   - All work with quiz generator

## 📈 How Scoring Works

- **Range**: 0-100%
- **Calculation**: Average of all question scores
- **Grading**: Lenient (considers variations)
- **Stored**: All scores saved to database

### Example:
```
Question 1: 95/100
Question 2: 100/100
Question 3: 70/100
─────────────────
Average Score: 88% ✓
```

## ⚙️ Customization

### Quiz Size
```
Questions Per Quiz: 5 ─── 30
                    ▲      ▲
                   Min    Max
```
- **5-10**: Quick review
- **10-15**: Standard quiz
- **15-20**: Comprehensive
- **20-30**: Full assessment

## 🔄 Quiz Lifecycle

```
1. Create/Upload Document
         ↓
2. Click "Generate Quiz"
         ↓
3. Select Document & Options
         ↓
4. Qwen 3 Generates Questions
         ↓
5. Answer Each Question
         ↓
6. Get AI Feedback
         ↓
7. Submit Quiz
         ↓
8. View Results
         ↓
9. Save to Database
         ↓
10. Download or Retake
```

## 📱 Device Support

- ✓ Desktop (recommended)
- ✓ Tablet
- ✓ Mobile (responsive UI)

## 🆘 Troubleshooting

### Quiz Won't Generate
- Ensure document has content
- Check Qwen API key is set
- Try with shorter document first

### Evaluation Takes Long
- Normal (AI processing)
- Usually 2-5 seconds per answer
- Be patient, high-quality feedback

### Can't Download Results
- Try different browser
- Check file permissions
- Clear browser cache

## 💾 Data Storage

All quiz attempts are saved with:
- User ID
- Document title
- Questions answered
- Your answers
- AI feedback
- Final score
- Timestamp

Access anytime: `/api/quizzes/attempts`

## 🎯 Success Metrics

Track your improvement:
- **Score Improvement**: Compare attempts
- **Time Efficiency**: Less time per question
- **Accuracy**: Higher correct answer rate
- **Confidence**: Faster answer selection

## 🌟 Pro Tips

1. **Screenshot Feedback** - Save valuable feedback for later
2. **Print Results** - Have hardcopy for study groups
3. **Share Results** - Download and discuss with peers
4. **Multiple Attempts** - Same document, different questions each time
5. **Combine Documents** - Create overarching quizzes

## 📞 Questions?

- Check the detailed documentation: `AI_QUIZ_SYSTEM.md`
- Review API endpoints: `/app/api/quizzes/`
- Check component code: `/components/Quiz*.jsx`

---

**Version**: 1.0.0  
**Last Updated**: December 31, 2025  
**Status**: Production Ready ✓
