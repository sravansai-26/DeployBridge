---

# 📄 **CONTRIBUTING.md**

````markdown
# Contributing to DeployBridge

Thank you for your interest in contributing!  
DeployBridge is created by **Team TechnoTitans** as a full-stack deployment automation platform.  
We welcome improvements, suggestions, and bug fixes.

---

## 🚀 How to Contribute

### 1. Fork the repository
Click **Fork** on the top-right of the GitHub repo.

### 2. Clone your fork locally
```sh
git clone <YOUR_FORK_URL>
cd DeployBridge
````

### 3. Create a new feature branch

```sh
git checkout -b feature-your-feature-name
```

### 4. Install dependencies

#### Frontend

```sh
npm install
npm run dev
```

#### Backend

```sh
cd backend
npm install
npm run dev
```

---

## 🧩 Project Structure

```
DeployBridge/
  ├── backend/        → Node.js + Express server
  ├── src/            → Frontend (Vite + React + TS)
  ├── public/         → Static assets
  ├── .env            → Environment file (ignored in Git)
  ├── README.md       → Project documentation
  ├── CONTRIBUTING.md → Contribution guidelines
  ├── CODE_OF_CONDUCT.md
  
```

---

## 📋 Guidelines for Contributions

### ✔ Code Style

* Follow existing code formatting.
* Use **TypeScript** where applicable.
* Maintain meaningful variable and function names.

### ✔ Commits

* Keep commits small and descriptive.
* Use conventional commit style when possible:

  ```
  feat: add Google OAuth login
  fix: resolve Vercel deployment error
  refactor: improve file upload logic
  ```

### ✔ Testing

Before submitting a PR:

* Run the frontend and backend
* Test uploading a ZIP
* Test deployment flow
* Test authentication (email + Google)

---

## 🐛 Reporting Issues

If you face a bug:

1. Go to **Issues** tab.
2. Click **New Issue**.
3. Provide:

   * Clear title
   * Steps to reproduce
   * Expected vs actual behavior
   * Screenshots (if possible)

---

## 🔧 Submitting a Pull Request (PR)

1. Push your feature branch:

   ```sh
   git push origin feature-your-feature-name
   ```

2. Open a PR on GitHub:

   * Describe what you added or fixed.
   * Link any related issue.
   * Explain why this change is needed.

3. Wait for reviewers.

---

## ❤️ Contribution Types Welcome

You can contribute in many ways:

* 🚀 New features
* 🐛 Bug fixes
* 📄 Documentation improvements
* ✨ UI enhancements
* ⚙ Backend optimizations
* 🔐 Security improvements
* 🔌 Adding more deployment providers

---

## 🧑‍🤝‍🧑 Code of Conduct

Please follow our **CODE_OF_CONDUCT.md** to maintain a respectful environment for everyone.

---

## 📨 Contact

If you have questions, reach out at:

📧 [lyfspot@zohomail.in](mailto:lyfspot@zohomail.in)
Or open a GitHub issue.

---

### Thank you for helping improve DeployBridge!

Your contributions make the platform better for everyone. 🎉

```
