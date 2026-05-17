const isCi = process.env.CI === 'true' || process.env.CI === '1';

module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4173"],
      startServerCommand: "cd client && npm run build && npm run preview -- --port 4173",
      numberOfRuns: 1
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.5}],
        'categories:accessibility': ['warn', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.9}],
        'categories:seo': ['warn', {minScore: 0.9}]
      }
    },
    upload: isCi
      ? {
          target: 'temporary-public-storage'
        }
      : {
          target: 'filesystem',
          outputDir: '.lighthouseci/report'
        }
  }
};
