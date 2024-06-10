# Contributing to 42-stats
We want to make contributing to this project as easy and transparent as possible, whether it's:
*  Reporting a bug
*  Discussing the current state of the code
*  Submitting a fix
*  Proposing new features
## We Develop with GitHub
We use GitHub to host code, track issues and feature requests, as well as accept pull requests.
We use [GitHub FLow](https://guides.github.com/introduction/flow/index.html): All Changes Happen Through Pull Requests
Pull Requests are the best way to propose changes to the codebase, they are always welcome:
1.  Fork the repo and create your branch from `main`.
2.  If you have added code that should be tested, add tests.
3.  Ensure the tests pass.
4.  Make sure your code is formatted correctly! See [Coding Style](#coding-style) for details.
5.  Submit the pull request!
## Any Contributions You Make Will be under the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) Software License
When you submit code changes, your submissions are understood to be under the same license that covers the project.
## Report Bugs using GitHub's [Issues](https://github.com/42-stats/42-stats/issues)
We use GitHub issues to track bugs. Report a bug by [opening an issue](https://github.com/winstonallo/student-council-42vienna/issues); it's very easy!
## Write Bug Reports with Detail, Background and Sample Code!
**Good Bug Reports** tend to have:
*  A quick summary and/or background
*  Steps to reproduce
   * Be specific!
   * Give sample code if you can.
*  What you expected would happen
*  What actually happens
*  Notes, for example:
   * What you think might be happening
   * Stuff you tried that did not work

The more thorough the bug report, the easier the fix 🫀
## Coding Style
We use the [Black](https://black.readthedocs.io/) formatter for Python and [Prettier]((https://prettier.io/)) for TypeScrit, HTML and CSS.
**How to use Black:**
* Use the VSCode extension and configure line length in the settings.
* Alternatively:
  *  `pip install black`
  *  run `black` with the line length set to 120 in the root of your repo: `black --line-length 120 .`
**How to use Prettier:**
*  Use the VSCode extension and add the (the Prettier config file [.prettierrc](https://github.com/winstonallo/student-council-42vienna/blob/main/.prettierrc) is at the root of the repo).
* Alternatively:
  * `npm install prettier`
  * `npx prettier --config .prettierrc --write "**/*.{ts,tsx,html,css,scss}"`

**Pull Requests with failed stylechecks will be automatically denied!**
## Discord server
We have a Discord server to facilitate communication between contributors.

Click [here](https://discord.gg/FSBbTg8R) to join.
## References
This document was adapted from [briandk's contributing guidelines template](https://gist.github.com/briandk/3d2e8b3ec8daf5a27a62)
