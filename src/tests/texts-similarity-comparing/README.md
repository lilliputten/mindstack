R&D:

- [DeepSeek thread](https://chat.deepseek.com/a/chat/s/ffccb5f7-472a-4bd9-bfb7-d7aed258f4ff)

Natural library:

- [Introduction | Natural](https://naturalnode.github.io/natural/)
- [natural - npm](https://www.npmjs.com/package/natural)

[Implementing Locale-Sensitive Text Similarity in JS - DeepSeek](https://chat.deepseek.com/a/chat/s/ffccb5f7-472a-4bd9-bfb7-d7aed258f4ff)

## . Can Natural Work in Browser?

Short answer: Partially, but with significant limitations.

### The Problem:

1. Heavy Dependencies: Natural depends on Node.js built-in modules (`fs`, `path`, `util`) and native extensions
2. Large Bundle Size: Full library is ~2MB+ after minification
3. Memory Issues: Loads entire dictionaries into memory
4. Performance: Tokenization and stemming are CPU-intensive for large texts
