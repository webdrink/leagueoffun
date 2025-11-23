# CI Integration Guide for NameBlame Testing

This guide provides comprehensive CI/CD integration for automated NameBlame testing using GitHub Actions, including multi-browser testing, test result reporting, and quality gates.

## GitHub Actions Workflow Configuration

### Complete CI Workflow

Create `.github/workflows/comprehensive-testing.yml`:

```yaml
name: Comprehensive NameBlame Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'

env:
  NODE_VERSION: '18'
  CACHE_VERSION: 'v1'

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Run TypeScript check
        run: npm run typecheck
        
      - name: Verify assets
        run: npm run verify-assets

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright dependencies
        run: npx playwright install --with-deps
        
      - name: Run unit tests
        run: npx playwright test tests/unit/
        
      - name: Upload unit test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: unit-test-results
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  foundation-tests:
    name: Foundation Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright dependencies
        run: npx playwright install --with-deps
        
      - name: Run foundation tests
        run: npm run test:foundation
        
      - name: Upload foundation test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: foundation-test-results
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  nameblame-comprehensive-tests:
    name: NameBlame Comprehensive Tests
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, foundation-tests]
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright dependencies
        run: npx playwright install --with-deps
        
      - name: Run NameBlame comprehensive tests (Shard ${{ matrix.shard }})
        run: npx playwright test tests/flows/nameblame-mode/ --shard=${{ matrix.shard }}/3
        
      - name: Upload NameBlame test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: nameblame-test-results-shard-${{ matrix.shard }}
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  cross-browser-tests:
    name: Cross-Browser Tests
    runs-on: ubuntu-latest
    needs: [nameblame-comprehensive-tests]
    strategy:
      fail-fast: false
      matrix:
        browser: [firefox, webkit]
        
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright dependencies
        run: npx playwright install --with-deps
        
      - name: Run cross-browser tests (${{ matrix.browser }})
        run: npx playwright test --project=cross-browser-${{ matrix.browser }}
        
      - name: Upload cross-browser test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cross-browser-${{ matrix.browser }}-results
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  mobile-tests:
    name: Mobile Tests
    runs-on: ubuntu-latest
    needs: [nameblame-comprehensive-tests]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright dependencies
        run: npx playwright install --with-deps
        
      - name: Run mobile tests
        run: npm run test:mobile
        
      - name: Upload mobile test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: mobile-test-results
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  accessibility-tests:
    name: Accessibility Tests
    runs-on: ubuntu-latest
    needs: [nameblame-comprehensive-tests]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright dependencies
        run: npx playwright install --with-deps
        
      - name: Run accessibility tests
        run: npm run test:accessibility
        
      - name: Upload accessibility test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: accessibility-test-results
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    needs: [nameblame-comprehensive-tests]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright dependencies
        run: npx playwright install --with-deps
        
      - name: Run performance tests
        run: npm run test:performance
        
      - name: Upload performance test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: performance-test-results
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  generate-test-report:
    name: Generate Test Report
    runs-on: ubuntu-latest
    needs: [unit-tests, foundation-tests, nameblame-comprehensive-tests, cross-browser-tests, mobile-tests, accessibility-tests, performance-tests]
    if: always()
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Download all test artifacts
        uses: actions/download-artifact@v4
        with:
          path: test-artifacts
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright dependencies
        run: npx playwright install --with-deps
        
      - name: Merge test results
        run: |
          npx playwright merge-reports --reporter=html test-artifacts/*/playwright-report/
          
      - name: Upload merged test report
        uses: actions/upload-artifact@v4
        with:
          name: comprehensive-test-report
          path: playwright-report/
          retention-days: 30
          
      - name: Deploy test report to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./playwright-report
          destination_dir: test-reports/${{ github.run_number }}

  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    needs: [unit-tests, foundation-tests, nameblame-comprehensive-tests, cross-browser-tests, mobile-tests, accessibility-tests, performance-tests]
    if: always()
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Download test artifacts
        uses: actions/download-artifact@v4
        with:
          path: test-artifacts
          
      - name: Analyze test results
        id: analyze
        run: |
          # Check for test failures
          FAILURES=0
          if [ -d "test-artifacts" ]; then
            for dir in test-artifacts/*/test-results/; do
              if [ -d "$dir" ]; then
                FAIL_COUNT=$(find "$dir" -name "*.json" | xargs grep -l '"status":"failed"' | wc -l)
                FAILURES=$((FAILURES + FAIL_COUNT))
              fi
            done
          fi
          
          echo "Total failures: $FAILURES"
          echo "failures=$FAILURES" >> $GITHUB_OUTPUT
          
          # Set quality gate thresholds
          if [ $FAILURES -eq 0 ]; then
            echo "status=passed" >> $GITHUB_OUTPUT
            echo "message=All tests passed! ✅" >> $GITHUB_OUTPUT
          elif [ $FAILURES -le 5 ]; then
            echo "status=warning" >> $GITHUB_OUTPUT
            echo "message=Some tests failed ($FAILURES), review required ⚠️" >> $GITHUB_OUTPUT
          else
            echo "status=failed" >> $GITHUB_OUTPUT
            echo "message=Too many test failures ($FAILURES), quality gate failed ❌" >> $GITHUB_OUTPUT
          fi
          
      - name: Update commit status
        uses: actions/github-script@v7
        with:
          script: |
            const status = '${{ steps.analyze.outputs.status }}';
            const message = '${{ steps.analyze.outputs.message }}';
            
            let state, description;
            if (status === 'passed') {
              state = 'success';
              description = 'All NameBlame tests passed';
            } else if (status === 'warning') {
              state = 'success';
              description = 'Tests passed with warnings';
            } else {
              state = 'failure';
              description = 'Quality gate failed';
            }
            
            await github.rest.repos.createCommitStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: context.sha,
              state: state,
              description: description,
              context: 'NameBlame Quality Gate'
            });
            
      - name: Fail if quality gate failed
        if: steps.analyze.outputs.status == 'failed'
        run: |
          echo "Quality gate failed: ${{ steps.analyze.outputs.message }}"
          exit 1

  notify-completion:
    name: Notify Completion
    runs-on: ubuntu-latest
    needs: [quality-gate]
    if: always()
    
    steps:
      - name: Send notification
        if: github.ref == 'refs/heads/main'
        uses: actions/github-script@v7
        with:
          script: |
            const { data: workflow } = await github.rest.actions.getWorkflowRun({
              owner: context.repo.owner,
              repo: context.repo.repo,
              run_id: context.runId
            });
            
            const status = workflow.conclusion;
            const emoji = status === 'success' ? '✅' : status === 'failure' ? '❌' : '⚠️';
            
            console.log(`Workflow completed with status: ${status} ${emoji}`);
```

## Enhanced Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:ci": "playwright test --reporter=html,junit",
    "test:ci-unit": "playwright test tests/unit/ --reporter=html,junit",
    "test:ci-nameblame": "playwright test tests/flows/nameblame-mode/ --reporter=html,junit",
    "test:ci-smoke": "playwright test tests/foundation/app-initialization.spec.ts tests/flows/classic-mode/quick-start.spec.ts --reporter=html,junit",
    "test:coverage": "playwright test --reporter=html --reporter=coverage",
    "test:parallel": "playwright test --workers=4",
    "test:retry": "playwright test --retries=2",
    "test:headed-ci": "playwright test --headed --reporter=list",
    "test:record": "playwright test --reporter=html --trace=on",
    "ci:quality-check": "npm run lint && npm run typecheck && npm run verify-assets",
    "ci:test-unit": "npm run test:ci-unit",
    "ci:test-nameblame": "npm run test:ci-nameblame", 
    "ci:test-full": "npm run test:ci",
    "ci:publish-results": "npx playwright show-report --host=0.0.0.0 --port=3000"
  }
}
```

## Playwright Configuration Enhancements

Update `playwright.config.ts` for CI optimization:

```typescript
// Add to existing config
export default defineConfig({
  // ... existing config
  
  // CI-specific settings
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  // Reporter configuration for CI
  reporter: process.env.CI ? [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github'],
    ['list']
  ] : [
    ['html', { open: 'on-failure' }],
    ['list']
  ],
  
  // CI-optimized use settings
  use: {
    // ... existing use config
    
    // CI-specific settings
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: process.env.CI ? 'only-on-failure' : 'on-first-retry',
    video: process.env.CI ? 'retain-on-failure' : 'retry-with-video',
    
    // Environment detection
    baseURL: process.env.CI 
      ? 'http://localhost:3000' 
      : 'http://localhost:5173',
  },
  
  // Web server for CI
  webServer: process.env.CI ? {
    command: 'npm run build && npm run preview',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  } : {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
```

## Quality Gates and Metrics

### Test Result Analysis Script

Create `scripts/analyze-test-results.js`:

```javascript
const fs = require('fs');
const path = require('path');

/**
 * Analyze Playwright test results and generate quality metrics
 */
function analyzeTestResults() {
  const testResultsDir = 'test-results';
  const reportPath = 'playwright-report';
  
  if (!fs.existsSync(testResultsDir)) {
    console.log('No test results found');
    return;
  }
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let flakyTests = 0;
  
  // Analyze test result files
  const resultFiles = fs.readdirSync(testResultsDir)
    .filter(file => file.endsWith('.json'));
    
  resultFiles.forEach(file => {
    const filePath = path.join(testResultsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      const result = JSON.parse(content);
      
      totalTests++;
      
      switch (result.status) {
        case 'passed':
          passedTests++;
          break;
        case 'failed':
          failedTests++;
          break;
        case 'skipped':
          skippedTests++;
          break;
        case 'flaky':
          flakyTests++;
          break;
      }
    } catch (error) {
      console.error(`Error parsing ${file}:`, error.message);
    }
  });
  
  // Calculate metrics
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
  const failRate = totalTests > 0 ? (failedTests / totalTests * 100).toFixed(2) : 0;
  
  // Generate report
  const report = {
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      flaky: flakyTests,
      passRate: `${passRate}%`,
      failRate: `${failRate}%`
    },
    qualityGate: {
      status: failedTests === 0 ? 'PASSED' : failedTests <= 5 ? 'WARNING' : 'FAILED',
      message: failedTests === 0 
        ? 'All tests passed!'
        : failedTests <= 5 
        ? `${failedTests} tests failed - review required`
        : `${failedTests} tests failed - quality gate failed`
    },
    timestamp: new Date().toISOString()
  };
  
  // Output results
  console.log('=== NameBlame Test Results ===');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${passRate}%)`);
  console.log(`Failed: ${failedTests} (${failRate}%)`);
  console.log(`Skipped: ${skippedTests}`);
  console.log(`Flaky: ${flakyTests}`);
  console.log(`Quality Gate: ${report.qualityGate.status}`);
  console.log(`Message: ${report.qualityGate.message}`);
  
  // Save report
  fs.writeFileSync('test-results/summary.json', JSON.stringify(report, null, 2));
  
  // Exit with appropriate code
  process.exit(report.qualityGate.status === 'FAILED' ? 1 : 0);
}

analyzeTestResults();
```

## Branch Protection Rules

Configure these branch protection rules in GitHub:

1. **Required Status Checks:**
   - NameBlame Quality Gate
   - Lint & Type Check
   - Foundation Tests
   - NameBlame Comprehensive Tests

2. **Required Reviews:**
   - Require 1 review for PRs
   - Dismiss stale reviews when new commits are pushed
   - Require review from code owners

3. **Restrictions:**
   - Restrict pushes to main branch
   - Include administrators in restrictions

## Test Environment Configuration

### Environment Variables

Set these in GitHub repository secrets:

```bash
# Required for CI
CI=true
NODE_ENV=test

# Optional for enhanced reporting
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false
PLAYWRIGHT_HTML_REPORT=playwright-report
PLAYWRIGHT_JUNIT_OUTPUT_FILE=test-results/junit.xml

# For deployment testing
VITE_BASE_PATH=/
```

### Docker Configuration (Optional)

Create `Dockerfile.test` for containerized testing:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.55.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

## Monitoring and Alerting

### GitHub Actions Notifications

Add webhook notifications for test failures:

```yaml
# Add to workflow
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#dev-alerts'
    text: 'NameBlame tests failed in ${{ github.ref }}'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Test Metrics Dashboard

Track these key metrics:

- **Test Execution Time:** Monitor test duration trends
- **Pass Rate:** Track test success percentage over time
- **Flaky Test Rate:** Identify unreliable tests
- **Coverage:** Monitor test coverage metrics
- **Browser Compatibility:** Track cross-browser test results

## Troubleshooting Guide

### Common CI Issues

1. **Timeout Issues:**
   ```yaml
   timeout-minutes: 30  # Increase timeout for complex tests
   ```

2. **Memory Issues:**
   ```yaml
   env:
     NODE_OPTIONS: --max-old-space-size=4096
   ```

3. **Browser Installation:**
   ```bash
   npx playwright install --with-deps chromium firefox webkit
   ```

### Debug Failed Tests

```bash
# Download test artifacts locally
gh run download <run-id>

# View test report
npx playwright show-report playwright-report/

# Run failed tests locally
npx playwright test --last-failed
```

This comprehensive CI integration ensures that NameBlame mode is thoroughly tested across all environments and provides early detection of issues while maintaining high code quality standards.