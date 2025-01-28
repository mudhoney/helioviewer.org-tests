<img src="https://playwright.dev/img/playwright-logo.svg" width=50 />

# Playwright Tests for Helioviewer.org

This repository contains playwright tests for [helioviewer.org](https://github.com/helioviewer-Project/helioviewer.org).

The main branch of tests run automatically when a pull request is made to
helioviewer.org, or the Helioviewer API repository. This is done through a
workflow trigger when a pull request is made in one of those repositories.

## Test Scenarios

By default, when a pull request is made, the PR branch is tested against the
main branches of the test and companion (api or heliovewer.org) repository.

This table shows which branches will be used when tests are triggered.
| Trigger | api | helioviewer.org | test |
|---------|-----|-----------------|------|
| pull request on [api](https://github.com/Helioviewer-Project/api/pulls) | PR | main | main |
| pull request on [helioviewer.org](https://github.com/Helioviewer-Project/helioviewer.org/pulls) | main | PR | main |
| pull request on test | main | main | PR |

### Choosing Branches

Sometimes a change requires updating other repositories.
An update to helioviewer.org may depend on an update to the API.
You can manually dispatch tests to run on selected branches using github's
workflow dispatch feature. Follow these steps:

1. Go to actions
![Where to click for actions](.images/actions.jpg)

2. Select the test workflow
![Location of test workflow](.images/workflow.jpg)

3. Enter the pull request numbers to test against. If left blank, then main
will be used by default.
![Workflow input form](.images/inputs.jpg)
