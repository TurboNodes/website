# Markdown Writing Guide

A comprehensive guide to writing effective .md articles with best practices and tips.

## Quick Start Checklist

- [ ] Use descriptive headings (H1 for title, H2-H6 for sections)
- [ ] Add a brief introduction in the first paragraph
- [ ] Use bullet points and numbered lists for readability
- [ ] Include code examples with proper syntax highlighting
- [ ] Add images with descriptive alt text
- [ ] Proofread for spelling and grammar

## Structure Your Article

### 1. Start with a Clear Title
```markdown
# How to Build Amazing Features
```

### 2. Add a Brief Introduction
Keep it under 50 words. Explain what the reader will learn.

### 3. Use Hierarchical Headings
```markdown
## Main Section
### Subsection
#### Details
```

## Formatting Tips

### Code Blocks
Use triple backticks with language specification:

```javascript
function example() {
  return "Hello World";
}
```

### Inline Code
Use single backticks for `variable names` and `function()` calls.

### Lists
**Unordered:**
- Use hyphens for consistency
- Keep items parallel in structure
- Don't end with periods

**Ordered:**
1. Use for step-by-step instructions
2. Each step should be actionable
3. Number automatically updates

### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](image-path.jpg)
```

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |
```

## Writing Best Practices

### Keep It Scannable
- Use short paragraphs (2-3 sentences)
- Add plenty of white space
- Use bullet points for key information
- Highlight important terms with **bold**

### Write for Your Audience
- Define technical terms on first use
- Use active voice
- Keep sentences under 20 words
- Use "you" to address the reader

### Code Examples
- Make them complete and runnable
- Add comments to explain complex logic
- Show both input and expected output
- Use realistic variable names

## Common Mistakes to Avoid

❌ **Don't:**
- Use generic headings like "Introduction"
- Write walls of text without breaks
- Forget to test your code examples
- Use unclear pronouns (it, this, that)

✅ **Do:**
- Use specific, descriptive headings
- Break content into digestible chunks
- Verify all code works as expected
- Be explicit about what you're referencing

## Tools and Extensions

### VS Code Extensions
- **Markdown All in One**: Preview and shortcuts
- **markdownlint**: Linting and style checking
- **Markdown Table**: Easy table editing

### Online Tools
- [Hemingway Editor](http://www.hemingwayapp.com/): Readability checker
- [Grammarly](https://grammarly.com/): Grammar and spelling
- [Markdown Tables Generator](https://www.tablesgenerator.com/markdown_tables)

## File Organization

```
articles/
├── 2024/
│   ├── 01-getting-started.md
│   ├── 02-advanced-tips.md
│   └── images/
│       ├── screenshot1.png
│       └── diagram.svg
└── templates/
    └── article-template.md
```

## Template for New Articles

```markdown
# Article Title

Brief description of what this article covers and who it's for.

## Prerequisites

- What readers should know before starting
- Required tools or setup

## Step 1: Getting Started

Detailed explanation with examples.

## Step 2: Implementation

More detailed steps with code examples.

## Conclusion

- Summary of what was covered
- Next steps or related articles
- Call to action

## References

- [Link to documentation](https://example.com)
- [Related article](https://example.com)
```

## Publishing Checklist

Before publishing your article:

- [ ] Read it aloud to catch awkward phrasing
- [ ] Check all links work
- [ ] Verify code examples run correctly
- [ ] Ensure images load and have alt text
- [ ] Review for consistent formatting
- [ ] Get feedback from a colleague
- [ ] Check readability score (aim for grade 8-10)

Remember: Great articles solve real problems and make complex topics accessible!
