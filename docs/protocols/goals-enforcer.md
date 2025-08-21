# Goals Enforcer Protocol

> 📚 **See also:** [Protocols Overview](./README.md)

This document defines the meta-protocol that governs the Dev Agent's decision-making process. It acts as an intelligent dispatcher, automatically analyzing user requests and applying the correct, more specific workflow protocol.

## 🚨 IRON RULE

**Upon receiving any user directive, the Dev Agent MUST first analyze the user's intent to determine the task type and then transparently apply the appropriate workflow protocol.** This process is automatic and non-negotiable.

- **New Functionality** → [feature-workflow.md](./feature-workflow.md)
- **Code Improvement** → [refactoring-workflow.md](./refactoring-workflow.md)
- **Version Release** → [release-workflow.md](./release-workflow.md)

## 🔍 Task Type Detection Logic

The agent uses a keyword-scoring mechanism to classify tasks.

### **Keywords for New Tasks ([feature-workflow.md](./feature-workflow.md)):**
- **Action Verbs:** `create`, `add`, `implement`, `build`, `make`, `configure`, `develop`
- **Nouns:** `feature`, `functionality`, `module`, `service`, `endpoint`, `component`, `interface`, `integration`, `api`
- **Concepts:** `new task`, `business requirement`, `user story`
- **Artifacts:** `documentation`, `readme`, `document`

### **Keywords for Refactoring ([refactoring-workflow.md](./refactoring-workflow.md)):**
- **Action Verbs:** `refactor`, `improve`, `optimize`, `fix`, `clean up`, `rewrite`, `simplify`, `enhance`
- **Nouns:** `code`, `structure`, `architecture`, `performance`, `readability`, `maintainability`
- **Concepts:** `technical debt`, `code smell`, `duplication`, `legacy code`
- **Techniques:** `rename`, `extract`, `split`, `remove`, `replace`

### **Keywords for Releases ([release-workflow.md](./release-workflow.md)):**
- **Action Verbs:** `release`, `deploy`, `publish`, `tag`, `finalize`
- **Nouns:** `version`, `release`, `tag`, `deployment`
- **Concepts:** `new version`, `prepare release`, `finish release`

## 📋 Protocol Application Workflow

This workflow is executed instantly and internally by the Dev Agent.

### **Step 1: User Message Analysis**
The agent processes the user's message to determine intent.

```typescript
/**
 * Analyzes the user's message to determine the task type.
 * @param message The user's directive.
 * @returns The determined task type.
 */
function analyzeUserMessage(message: string): 'feature' | 'refactoring' | 'release' {
  const messageLower = message.toLowerCase();

  // Keyword sets for scoring
  const featureKeywords = new Set(['create', 'add', 'implement', 'feature', 'functionality', 'module']);
  const refactorKeywords = new Set(['refactor', 'improve', 'optimize', 'code', 'structure', 'architecture']);
  const releaseKeywords = new Set(['release', 'deploy', 'publish', 'version', 'tag']);

  // Simple scoring
  let featureScore = 0;
  featureKeywords.forEach(kw => { if (messageLower.includes(kw)) featureScore++; });

  let refactorScore = 0;
  refactorKeywords.forEach(kw => { if (messageLower.includes(kw)) refactorScore++; });

  let releaseScore = 0;
  releaseKeywords.forEach(kw => { if (messageLower.includes(kw)) releaseScore++; });

  // Determine the winner
  const maxScore = Math.max(featureScore, refactorScore, releaseScore);
  if (maxScore === 0) return 'feature'; // Default to new tasks if no keywords match

  if (releaseScore === maxScore) return 'release';
  if (refactorScore === maxScore) return 'refactoring';
  return 'feature';
}
```

### **Step 2: Logging and Execution**
The agent logs its decision and begins executing the selected protocol.

// Example Log Output
console.log(`[Enforcer] Analyzing directive: "${userMessage}"`);
console.log(`[Enforcer] Task type determined: 'feature'`);
console.log(`[Enforcer] Applying protocol: 'feature-workflow.md'`);
console.log(`[Enforcer] Handing off control to the Feature Workflow service...`);
```

## 🔗 Related Protocols

- **[Feature Workflow](./feature-workflow.md)** - For implementing new functionality
- **[Refactoring Workflow](./refactoring-workflow.md)** - For code improvements and optimizations  
- **[Release Workflow](./release-workflow.md)** - For version releases and deployments
- **[Protocols Overview](./README.md)** - Complete list of all protocols