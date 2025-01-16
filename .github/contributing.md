### Contribution Guide for Xstro

1. **Fork the Repository**

   - Visit the [Xstro GitHub repository](https://github.com/AstroX11/Xstro).
   - Click the **Fork** button in the top-right corner to create your own copy of the project.

2. **Clone the Forked Repository**

   - Download your forked repository to your local machine:
     ```bash
     git clone https://github.com/<your-username>/Xstro.git
     cd Xstro
     ```

3. **Set Upstream for Updates**

   - Add the main Xstro repository as the `upstream` to ensure you can sync changes from the original project:
     ```bash
     git remote add upstream https://github.com/AstroX11/Xstro.git
     ```
   - Verify the remote repositories:
     ```bash
     git remote -v
     ```

4. **Create a New Branch**

   - Always create a separate branch for your contributions to keep your work organized:
     ```bash
     git checkout -b feature/your-feature-name
     ```
   - Use a descriptive branch name that reflects your changes, such as `bugfix/issue-12` or `feature/add-auth`.

5. **Make Your Changes**

   - Implement the changes or improvements in your branch.
   - Ensure that your changes align with the project's coding standards and structure.

6. **Test Your Changes**

   - Verify your changes thoroughly to ensure they work as intended and don’t introduce any bugs.
   - If the project has existing tests, run them to confirm your changes haven’t broken anything.

7. **Commit Your Changes**

   - Stage your changes and write a clear, concise commit message:
     ```bash
     git add .
     git commit -m "Description of changes, e.g., Fix login issue #12"
     ```

8. **Push to Your Fork**

   - Push your changes to the branch in your forked repository:
     ```bash
     git push origin feature/your-feature-name
     ```

9. **Submit a Pull Request**

   - Go to your forked repository on GitHub.
   - Click **Compare & pull request**.
   - Add a meaningful title and a detailed explanation of your changes.
   - Submit the pull request to the `main` branch of the original Xstro repository.

10. **Review Process**

    - The maintainers will review your pull request. If changes are required, they will provide feedback.
    - Make the requested updates and push them to the same branch to update the pull request.

11. **Merge or Close**
    - Once your changes are approved, they will be merged into the main repository. If not, the maintainers may explain why the contribution doesn’t fit and provide guidance.

---

### Guideline for you code

- **Keep It Clear:** Ensure your code is clean and easy to understand.
- **Write Meaningful Commits:** Use descriptive commit messages that explain what you’ve done.
- **Follow Project Standards:** Stick to the coding conventions used in the project.
- **Test Before Submitting:** Always test your changes to avoid introducing errors.
