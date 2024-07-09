# Contributing to the official 42 Vienna Student Council website
We want to make contributing to this project as easy and transparent as possible, whether it's:
*  Reporting a bug
*  Discussing the current state of the code
*  Submitting a fix
*  Proposing new features

## We Develop with GitHub
We use GitHub to host code, track issues and feature requests, as well as accept pull requests.
We use [GitHub FLow](https://guides.github.com/introduction/flow/index.html): **All Changes Happen Through Pull Requests**.

### Report Bugs using GitHub's Issues
We use GitHub issues to track bugs. Report a bug by [opening an issue](https://github.com/42-student-council/website/issues); it's very easy!

### Write Bug Reports with Detail, Background and Sample Code!
**Good Bug Reports** tend to have:
*  A quick summary and/or background
*  Steps to reproduce
   * Be specific!
   * Give sample code if you can.
*  What you expected would happen.
*  What actually happens.
*  Notes, for example:
   * What you think might be happening.
   * Stuff you tried that did not work.

The more thorough the bug report, the easier the fix :)

### Development Workflow
1. Create a branch `git checkout -b your-github-username/(feat|fix|docs)/branch-name`
2. Make your changes.
3. **Test your changes!**
4. Commit your changes: `git commit -m "(add|test|chore|style|fix): description-of-your-commit`
5. Push to your branch.
6. Open a Pull Request! Add screenshots, explanation of your thought process, anything that could be useful for code review.

### Code Review
Pull requests are reviewed by the project maintainers. Here's what we look for:
* Code quality
* Adequate testing coverage
* Clear and concise commit messages
* Relevance and necessity of the proposed changes.
* Documentation: If anything is unclear about what has been changed, how to test, (...), we _will_ deny the pull request.

### Updating Documentation

If your changes affect the project documentation (e.g. new features, changes to existing functionality), please update the relevant documentation files as part of your pull request. This helps keep our documentation up to date and useful for everyone.

### Coding Style
We use [Prettier]((https://prettier.io/)) for TypeScript, HTML and CSS.

**How to use Black:**
* Use the VSCode extension and configure line length in the settings.
* Alternatively:
  *  `pip install black`
  *  run `black` with the line length set to 120 in the root of your repo: `black --line-length 120 .`

**How to use Prettier:**
*  Use the VSCode extension and add the (the Prettier config file [.prettierrc](~/.prettierrc) is at the root of the repo).
* Alternatively:
  * `npm install prettier`
  * `npx prettier --config .prettierrc --write "**/*.{ts,tsx,html,css,scss}"`

**Pull Requests with failed stylechecks will be automatically denied!**
### Get in touch!
We have a Discord server to facilitate communication between contributors.

Click [here](https://discord.gg/FSBbTg8R) to join.

### Conclusion

Thank you for considering contributing to our student council's official website! We look forward to your contributions and appreciate your efforts. If you have any questions, feel free to reach out to us on Discord or via GitHub issues.
