# **Protocol Detection Test Examples**

This file contains test cases to verify that Dev Agent correctly identifies task types and applies the appropriate protocols.

## **🧪 Test Cases for New Tasks (high-efficiency-sop.md)**

### **Test Case 1: Feature Creation**
**Input:** "Create a function for automatic database backup"
**Expected Protocol:** `high-efficiency-sop.md`
**Expected Phase:** Phase 0: Initialization
**Keywords:** `create`, `function`, `automatic`

### **Test Case 2: API Integration**
**Input:** "Add integration with GitHub API for issues synchronization"
**Expected Protocol:** `high-efficiency-sop.md`
**Expected Phase:** Phase 0: Initialization
**Keywords:** `add`, `integration`, `API`

### **Test Case 3: New Configuration**
**Input:** "Configure logging system with file rotation"
**Expected Protocol:** `high-efficiency-sop.md`
**Expected Phase:** Phase 0: Initialization
**Keywords:** `configure`, `system`, `new`

### **Test Case 4: Documentation**
**Input:** "Make README file with installation instructions"
**Expected Protocol:** `high-efficiency-sop.md`
**Expected Phase:** Phase 0: Initialization
**Keywords:** `make`, `README`, `instructions`

## **🧪 Test Cases for Refactoring (refactoring.md)**

### **Test Case 1: Code Refactoring**
**Input:** "Need to refactor code in the authentication module"
**Expected Protocol:** `refactoring.md`
**Expected Phase:** Phase 0: Preparation & Analysis
**Keywords:** `refactor`, `code`, `module`

### **Test Case 2: Performance Optimization**
**Input:** "Improve performance of the sorting function"
**Expected Protocol:** `refactoring.md`
**Expected Phase:** Phase 0: Preparation & Analysis
**Keywords:** `improve`, `performance`, `function`

### **Test Case 3: Architecture Improvement**
**Input:** "Optimize database structure for better readability"
**Expected Protocol:** `refactoring.md`
**Expected Phase:** Phase 0: Preparation & Analysis
**Keywords:** `optimize`, `structure`, `readability`

### **Test Case 4: Code Cleanup**
**Input:** "Remove code duplication in services"
**Expected Protocol:** `refactoring.md`
**Expected Phase:** Phase 0: Preparation & Analysis
**Keywords:** `remove`, `duplication`, `code`

## **🧪 Test Cases for Edge Cases**

### **Test Case 1: Mixed Keywords**
**Input:** "Create new code and refactor old"
**Expected Protocol:** `high-efficiency-sop.md` (new-task score higher)
**Keywords:** `create`, `new` (2) vs `refactor`, `code` (2)
**Decision:** Tie goes to new-task by default

### **Test Case 2: Ambiguous Request**
**Input:** "What to do with this project?"
**Expected Protocol:** `high-efficiency-sop.md` (default fallback)
**Keywords:** None detected
**Decision:** Default to new-task protocol

### **Test Case 3: Complex Request**
**Input:** "Create new architecture and refactor existing code for performance improvement"
**Expected Protocol:** `high-efficiency-sop.md` (new-task score higher)
**Keywords:** `create`, `new`, `architecture` (3) vs `refactor`, `code`, `improve`, `performance` (4)
**Decision:** Refactoring protocol (higher score)

## **🔍 Protocol Detection Algorithm**

```typescript
interface ProtocolDetectionResult {
  taskType: 'new-task' | 'refactoring';
  protocol: string;
  confidence: number;
  keywords: string[];
  reasoning: string;
}

function detectProtocol(userMessage: string): ProtocolDetectionResult {
  const newTaskKeywords = [
    'create', 'add', 'implement', 'make', 'configure',
    'new', 'new', 'new', 'new',
    'function', 'functionality', 'capability',
    'task', 'requirement', 'feature',
    'integration', 'connection', 'API',
    'interface', 'UI', 'UX',
    'documentation', 'README', 'document'
  ];
  
  const refactorKeywords = [
    'refactoring', 'refactor', 'rewrite',
    'improve', 'optimize', 'fix',
    'code', 'structure', 'architecture',
    'rename', 'extract', 'split',
    'simplify', 'remove', 'replace',
    'quality', 'readability', 'performance',
    'duplication', 'repetition', 'copying'
  ];
  
  const messageLower = userMessage.toLowerCase();
  
  const newTaskScore = newTaskKeywords.filter(keyword => messageLower.includes(keyword)).length;
  const refactorScore = refactorKeywords.filter(keyword => messageLower.includes(keyword)).length;
  
  let taskType: 'new-task' | 'refactoring';
  let protocol: string;
  let confidence: number;
  let reasoning: string;
  
  if (newTaskScore > refactorScore) {
    taskType = 'new-task';
    protocol = 'high-efficiency-sop.md';
    confidence = newTaskScore / (newTaskScore + refactorScore);
    reasoning = `New task keywords detected: ${newTaskScore} vs refactoring: ${refactorScore}`;
  } else if (refactorScore > newTaskScore) {
    taskType = 'refactoring';
    protocol = 'refactoring.md';
    confidence = refactorScore / (newTaskScore + refactorScore);
    reasoning = `Refactoring keywords detected: ${refactorScore} vs new task: ${newTaskScore}`;
  } else {
    // Tie - default to new-task
    taskType = 'new-task';
    protocol = 'high-efficiency-sop.md';
    confidence = 0.5;
    reasoning = `Tie detected (${newTaskScore} vs ${refactorScore}), defaulting to new-task protocol`;
  }
  
  const detectedKeywords = [
    ...newTaskKeywords.filter(keyword => messageLower.includes(keyword)),
    ...refactorKeywords.filter(keyword => messageLower.includes(keyword))
  ];
  
  return {
    taskType,
    protocol,
    confidence,
    keywords: detectedKeywords,
    reasoning
  };
}
```

## **✅ Expected Behavior**

For each test case, Dev Agent should:

1. **Analyze** the user message
2. **Detect** the appropriate protocol
3. **Log** the detection process
4. **Apply** the correct protocol
5. **Execute** all required phases
6. **Report** progress at each step

## **📝 Testing Instructions**

To test protocol detection:

1. **Run each test case** through Dev Agent
2. **Verify** the correct protocol is selected
3. **Confirm** all protocol phases are executed
4. **Check** that progress is logged correctly
5. **Validate** the final outcome matches expectations
