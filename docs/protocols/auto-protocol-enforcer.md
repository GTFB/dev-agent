# **Automatic Protocol Enforcer**

This document defines the rules for automatically applying the correct protocol based on user input and task type.

## **🚨 IRON RULE**

**ALWAYS, when a user writes a message, automatically determine the task type and apply the appropriate protocol:**

- **New tasks** → `high-efficiency-sop.md`
- **Refactoring** → `refactoring.md`

## **🔍 Automatic Task Type Detection**

### **Keywords for new tasks (high-efficiency-sop.md):**
- `create`, `add`, `implement`, `make`, `configure`
- `new`, `new`, `new`, `new`
- `function`, `functionality`, `capability`
- `task`, `requirement`, `feature`
- `integration`, `connection`, `API`
- `interface`, `UI`, `UX`
- `documentation`, `README`, `document`

### **Keywords for refactoring (refactoring.md):**
- `refactoring`, `refactor`, `rewrite`
- `improve`, `optimize`, `fix`
- `code`, `structure`, `architecture`
- `rename`, `extract`, `split`
- `simplify`, `remove`, `replace`
- `quality`, `readability`, `performance`
- `duplication`, `repetition`, `copying`

## **📋 Automatic Protocol Application Protocol**

### **Step 1: User Message Analysis**
```typescript
function analyzeUserMessage(message: string): TaskType {
  const newTaskKeywords = ['create', 'add', 'implement', 'make', 'configure', 'new', 'function', 'task'];
  const refactorKeywords = ['refactoring', 'improve', 'optimize', 'code', 'structure', 'architecture'];
  
  const messageLower = message.toLowerCase();
  
  const newTaskScore = newTaskKeywords.filter(keyword => messageLower.includes(keyword)).length;
  const refactorScore = refactorKeywords.filter(keyword => messageLower.includes(keyword)).length;
  
  if (newTaskScore > refactorScore) return 'new-task';
  if (refactorScore > newTaskScore) return 'refactoring';
  return 'new-task'; // Default to new tasks
}
```

### **Step 2: Application of Appropriate Protocol**

#### **For new tasks (high-efficiency-sop.md):**
1. **Phase 0: Initialization** - Check `.tasks/in-progress/`
2. **Phase 1: Branch Preparation** - Create feature branch
3. **Phase 2: Implementation & Quality** - Implementation with tests
4. **Phase 3: Finalization & Delivery** - Rebase and quality
5. **Phase 4: Code Review & Merge** - PR and review
6. **Phase 5: Cleanup** - Branch cleanup

#### **For refactoring (refactoring.md):**
1. **Phase 0: Preparation & Analysis** - Analysis and tests
2. **Phase 1: Execution** - Small changes
3. **Phase 2: Quality Assurance** - Full quality check
4. **Phase 3: Code Review & Merge** - PR and review

## **🎯 Examples of Automatic Application**

### **Example 1: New Task**
**User message:** "Create a function for automatic database backup"

**Automatic analysis:** 
- Keywords: `create`, `function`, `automatic`
- Type: **New task**
- Protocol: **high-efficiency-sop.md**

**Action:** Follow Phase 0-5 for new tasks

### **Example 2: Refactoring**
**User message:** "Need to refactor code in the authentication module"

**Automatic analysis:**
- Keywords: `refactor`, `code`, `module`
- Type: **Refactoring**
- Protocol: **refactoring.md**

**Action:** Follow Phase 0-3 for refactoring

## **⚡ Automatic Execution**

**Dev Agent MUST automatically:**

1. **Analyze** user message
2. **Determine** task type
3. **Apply** appropriate protocol
4. **Execute** all protocol steps
5. **Report** progress at each stage

## **🔄 Integration with Existing Protocols**

This document **DOES NOT replace** existing protocols, but **automates their application**.

- `high-efficiency-sop.md` - remains the main protocol for new tasks
- `refactoring.md` - remains the main protocol for refactoring
- `auto-protocol-enforcer.md` - automatically selects and applies the needed protocol

## **📝 Protocol Application Logging**

Every time a protocol is automatically applied, Dev Agent must log:

```typescript
console.log(`🔍 Message analysis: "${userMessage}"`);
console.log(`📋 Task type determined: ${taskType}`);
console.log(`📚 Protocol applied: ${protocolName}`);
console.log(`🚀 Starting execution Phase ${currentPhase}: ${phaseDescription}`);
```
