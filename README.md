# **cmit — Interactive Commit Helper**

`cmit` is a lightweight, elegant CLI tool that makes your Git commit workflow faster, cleaner, and more consistent.
It provides an interactive staging and commit experience, enforcing good commit hygiene while staying simple to use.

---

## ✨ **Features**

- 🚀 **Interactive commit flow**
  Stage/unstage files, choose type, write messages — all in a guided UI.

- ⚡ **Quick mode (`-q`)**
  Commit instantly without UI:

  ```
  cmit -q feat "Add login button" "Additional optional description"
  ```

- 🔒 **Safe commits**
  - Detects merge conflicts
  - Prevents empty commits
  - Protects against broken Git hooks
  - Warns if nothing is staged

- 📌 **Supports amend (`--amend`)**

- 📤 **Optional auto-push (`--push`)**
  Or enable autoPush in config.

- 🔧 **Custom commit types via config** (`cmit` config file)

- 📊 **Tracks your usage stats** in `.cmit-stats.json`

- 🧩 **Small & dependency-light**
  No complex configs or global setup needed.

---

# 📦 **Installation**

### **1. Install globally via npm**

```bash
npm install -g cmit
```

### **2. Or use via npx (no install needed)**

```bash
npx cmit
```

### **3. Local project install**

```bash
npm install cmit --save-dev
```

Run it via:

```bash
npx cmit
```

---

# 🛠️ **Usage**

Running `cmit` without arguments opens the full interactive mode:

```bash
cmit
```

### Interactive flow includes:

- File staging (stage / unstage)
- Selecting commit type
- Writing commit message
- Optional description
- Preview commit before finishing

---

# ⚡ **Quick Mode**

If you want to bypass the UI:

```bash
cmit -q <type> <message> [description]
```

Examples:

```bash
cmit -q fix "Correct path bug"
cmit -q feat "Add search API" "Supports pagination + caching"
```

---

# 🔧 **Options**

| Flag              | Description                                    |
| ----------------- | ---------------------------------------------- |
| `-q`, `--quick`   | Quick commit mode                              |
| `--push`          | Push after committing                          |
| `--amend`         | Amend previous commit                          |
| `--ai`            | Reserved for future AI-based commit generation |
| `-h`, `--help`    | Show help                                      |
| `-v`, `--version` | Show version                                   |

---

# ⚙️ **Configuration**

cmit auto-detects a configuration file using `cosmiconfig`.
You may create any of the following:

- `cmit.config.js`
- `.cmitrc`
- `.cmitrc.json`
- `.cmitrc.yaml`

### Example config:

```json
{
  "types": {
    "feat": "new feature",
    "fix": "bug fix",
    "refactor": "code refactor",
    "deps": "dependency update",
    "perf": "performance improvement"
  },
  "emoji": false,
  "autoScope": false,
  "lintBefore": false,
  "aiEnabled": false,
  "autoPush": false
}
```

---

# 🧭 **Examples**

### Standard interactive commit:

```bash
cmit
```

### Quick mode commit:

```bash
cmit -q chore "Update ignore patterns"
```

### Amend last commit:

```bash
cmit --amend
```

### Push automatically:

```bash
cmit --push
```

### Combine quick mode + push:

```bash
cmit -q fix "Crash fix" --push
```

---

# 🚧 **Upcoming Features**

Planned enhancements:

- 🧪 **Pre-commit lint support**
- 🧩 **Scopes auto-detection (folder-based)**
- 📝 **Conventional Commit validation**
- 📤 **Auto-changelog generator**
- 🌈 **Emoji mode**
- ⚡ **CI integration for status checks**

You can request or vote for features in the Upcoming Issues tab.

---

## 1️⃣ **Fork the repository**

Click **Fork** in GitHub.

---

## 2️⃣ **Clone your fork**

```bash
git clone https://github.com/<your-username>/cmit
cd cmit
```

---

## 3️⃣ **Create a new branch**

```bash
git checkout -b feat/new-feature
```

---

## 4️⃣ **Install dependencies**

```bash
npm install
```

---

## 5️⃣ **Run development build**

```bash
npm run dev
```

---

## 6️⃣ **Commit using cmit itself!**

```bash
npx cmit
```

---

## 7️⃣ **Push & open pull request**

```bash
git push origin feat/new-feature
```

Then open a PR targeting:

> **test branch**

I will review PRs quickly and provide feedback.

---

# 🧪 **Testing Your Contribution**

Before opening a PR:

- Run the CLI locally
- Test both interactive + quick modes
- Ensure no crashes on invalid scenarios
- Test amend + push flow
- Run TypeScript compiler

  ```bash
  npm run build
  ```

---

# ❤️ Thanks for using cmit

If this project helps your workflow, consider starring ⭐ the repo — it really helps!

For issues or suggestions, check the **Issues** tab.

---
