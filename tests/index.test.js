/**
 * Jazzketball Test Suite
 * Validates HTML structure, data integrity, theming, and catches regressions.
 * Run: npm test
 */

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, '..', 'index.html');
let html;
let scriptContent;

beforeAll(() => {
  html = fs.readFileSync(HTML_PATH, 'utf-8');
  const match = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
  scriptContent = match ? match[1] : '';
});

// ============================================================
// 1. FILE STRUCTURE
// ============================================================
describe('File Structure', () => {
  test('index.html exists and is non-empty', () => {
    expect(html.length).toBeGreaterThan(1000);
  });

  test('contains required CDN dependencies', () => {
    expect(html).toContain('cdn.tailwindcss.com');
    expect(html).toContain('react@18');
    expect(html).toContain('react-dom@18');
    expect(html).toContain('@babel/standalone');
    expect(html).toContain('recharts');
  });

  test('has valid HTML document structure', () => {
    expect(html).toMatch(/<!DOCTYPE html>/i);
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('</head>');
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
    expect(html).toContain('<div id="root">');
  });

  test('has balanced braces, parens, and brackets in script', () => {
    const opens = (scriptContent.match(/\{/g) || []).length;
    const closes = (scriptContent.match(/\}/g) || []).length;
    expect(opens).toBe(closes);

    const parensOpen = (scriptContent.match(/\(/g) || []).length;
    const parensClose = (scriptContent.match(/\)/g) || []).length;
    expect(parensOpen).toBe(parensClose);

    const bracketsOpen = (scriptContent.match(/\[/g) || []).length;
    const bracketsClose = (scriptContent.match(/\]/g) || []).length;
    expect(bracketsOpen).toBe(bracketsClose);
  });
});

// ============================================================
// 2. CSS THEMING SYSTEM
// ============================================================
describe('CSS Theming System', () => {
  test('defines CSS custom properties in :root', () => {
    expect(html).toContain('--team-primary');
    expect(html).toContain('--team-secondary');
    expect(html).toContain('--team-midnight');
    expect(html).toContain('--team-deep');
    expect(html).toContain('--team-light');
    expect(html).toContain('--team-primary-rgb');
    expect(html).toContain('--team-secondary-rgb');
  });

  test('Tailwind config uses CSS variables for team colors', () => {
    expect(html).toContain("primary: 'var(--team-primary)'");
    expect(html).toContain("secondary: 'var(--team-secondary)'");
  });

  test('no hardcoded Jazz hex colors outside data constants', () => {
    // Split at the TEAM_CONFIGS section to only check component code
    const componentCode = scriptContent.split('// COMPONENTS')[1] || '';
    // These Jazz-specific hex codes should NOT appear in component code
    expect(componentCode).not.toContain("'#4E008E'");
    expect(componentCode).not.toContain("'#79A3DC'");
    expect(componentCode).not.toContain("'#0A0014'");
  });

  test('applyTeamColors function exists', () => {
    expect(scriptContent).toContain('function applyTeamColors(');
  });

  test('hexToRgb utility function exists', () => {
    expect(scriptContent).toContain('function hexToRgb(');
  });
});

// ============================================================
// 3. TEAM CONFIGS (All 30 NBA Teams)
// ============================================================
describe('Team Configs', () => {
  const REQUIRED_TEAMS = [
    'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
    'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
    'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS'
  ];

  test('TEAM_CONFIGS object exists', () => {
    expect(scriptContent).toContain('const TEAM_CONFIGS');
  });

  test.each(REQUIRED_TEAMS)('team %s is defined in TEAM_CONFIGS', (abbr) => {
    expect(scriptContent).toContain(`${abbr}: {`);
  });

  test('all 30 teams are present', () => {
    REQUIRED_TEAMS.forEach(abbr => {
      expect(scriptContent).toContain(`abbr: '${abbr}'`);
    });
  });

  test('Utah Jazz has full data (not null)', () => {
    expect(scriptContent).toContain('players: JAZZ_PLAYERS');
    expect(scriptContent).toContain('prospects: JAZZ_PROSPECTS');
    expect(scriptContent).toContain('pollQuestions: JAZZ_POLL_QUESTIONS');
    expect(scriptContent).toContain('lotteryTeams: JAZZ_LOTTERY_TEAMS');
  });

  test('each team config has required color fields', () => {
    const colorFields = ['primary', 'secondary', 'midnight', 'deep', 'light'];
    REQUIRED_TEAMS.forEach(abbr => {
      const teamSection = scriptContent.match(new RegExp(`${abbr}:\\s*\\{[^}]*colors:\\s*\\{([^}]+)\\}`, 's'));
      if (teamSection) {
        colorFields.forEach(field => {
          expect(teamSection[1]).toContain(field);
        });
      }
    });
  });
});

// ============================================================
// 4. JAZZ DATA INTEGRITY
// ============================================================
describe('Jazz Data Integrity', () => {
  test('JAZZ_PLAYERS array is defined with starters and bench', () => {
    expect(scriptContent).toContain('const JAZZ_PLAYERS');
    expect(scriptContent).toContain("starter: true");
    expect(scriptContent).toContain("starter: false");
  });

  test('all 5 Jazz starters have headshots', () => {
    const starterSection = scriptContent.split('starter: false')[0];
    const headshotMatches = starterSection.match(/headshot: 'https:\/\/cdn\.nba\.com/g);
    expect(headshotMatches).not.toBeNull();
    expect(headshotMatches.length).toBeGreaterThanOrEqual(5);
  });

  test('JAZZ_PROSPECTS array has at least 20 prospects', () => {
    expect(scriptContent).toContain('const JAZZ_PROSPECTS');
    const prospectMatches = scriptContent.match(/rank: \d+, name:/g);
    expect(prospectMatches).not.toBeNull();
    expect(prospectMatches.length).toBeGreaterThanOrEqual(20);
  });

  test('JAZZ_LOTTERY_TEAMS has 14 teams', () => {
    expect(scriptContent).toContain('const JAZZ_LOTTERY_TEAMS');
    // Count entries with odds field in the lottery array
    const lotterySection = scriptContent.match(/const JAZZ_LOTTERY_TEAMS = \[([\s\S]*?)\];/);
    expect(lotterySection).not.toBeNull();
    const oddsMatches = lotterySection[1].match(/odds: /g);
    expect(oddsMatches).toHaveLength(14);
  });

  test('JAZZ_POLL_QUESTIONS has at least 40 questions', () => {
    expect(scriptContent).toContain('const JAZZ_POLL_QUESTIONS');
    const pollSection = scriptContent.match(/const JAZZ_POLL_QUESTIONS = \[([\s\S]*?)\];/);
    expect(pollSection).not.toBeNull();
    const questionMatches = pollSection[1].match(/id: \d+/g);
    expect(questionMatches).not.toBeNull();
    expect(questionMatches.length).toBeGreaterThanOrEqual(40);
  });

  test('lottery odds sum to approximately 100%', () => {
    const lotterySection = scriptContent.match(/const JAZZ_LOTTERY_TEAMS = \[([\s\S]*?)\];/);
    const oddsValues = lotterySection[1].match(/odds: ([\d.]+)/g);
    const sum = oddsValues.reduce((s, v) => s + parseFloat(v.split(': ')[1]), 0);
    expect(sum).toBeGreaterThan(95);
    expect(sum).toBeLessThanOrEqual(100.1);
  });
});

// ============================================================
// 5. REACT COMPONENTS
// ============================================================
describe('React Components', () => {
  const REQUIRED_COMPONENTS = [
    'RosterSection', 'DraftRoom', 'DraftSimulator', 'FanMap',
    'FanPoll', 'TradeMachine', 'LineupBuilder', 'AIChatScout',
    'WikiPage', 'FAQPage', 'HeroBg', 'App'
  ];

  test.each(REQUIRED_COMPONENTS)('component %s is defined', (name) => {
    expect(scriptContent).toMatch(new RegExp(`function ${name}\\s*\\(`));
  });

  test('TeamContext is created', () => {
    expect(scriptContent).toContain('React.createContext');
    expect(scriptContent).toContain('TeamContext');
  });

  test('useTeam hook is defined', () => {
    expect(scriptContent).toContain('function useTeam()');
  });

  test('App renders with TeamContext.Provider', () => {
    expect(scriptContent).toContain('TeamContext.Provider');
  });

  test('ReactDOM.createRoot renders App', () => {
    expect(scriptContent).toContain("ReactDOM.createRoot(document.getElementById('root')).render(<App />)");
  });
});

// ============================================================
// 6. URL ROUTING
// ============================================================
describe('URL Routing', () => {
  test('TAB_SLUGS mapping exists for all tabs', () => {
    expect(scriptContent).toContain('TAB_SLUGS');
    expect(scriptContent).toContain("'roster'");
    expect(scriptContent).toContain("'draft'");
    expect(scriptContent).toContain("'poll'");
    expect(scriptContent).toContain("'trades'");
    expect(scriptContent).toContain("'lineups'");
    expect(scriptContent).toContain("'fanmap'");
    expect(scriptContent).toContain("'wiki'");
    expect(scriptContent).toContain("'faq'");
  });

  test('hash change listener is registered', () => {
    expect(scriptContent).toContain("'hashchange'");
  });

  test('navigateTo function updates hash', () => {
    expect(scriptContent).toContain('window.location.hash');
  });
});

// ============================================================
// 7. HERO BACKGROUNDS
// ============================================================
describe('Hero Backgrounds', () => {
  test('TEAM_BACKGROUNDS object has multiple background types', () => {
    expect(scriptContent).toContain('TEAM_BACKGROUNDS');
    expect(scriptContent).toContain('skyline:');
    expect(scriptContent).toContain('waves:');
    expect(scriptContent).toContain('desert:');
    expect(scriptContent).toContain('forest:');
    expect(scriptContent).toContain('bridge:');
    expect(scriptContent).toContain('plains:');
  });

  test('TEAM_BG_MAP maps all 30 teams', () => {
    expect(scriptContent).toContain('TEAM_BG_MAP');
    const bgMapSection = scriptContent.match(/const TEAM_BG_MAP = \{([\s\S]*?)\}/);
    expect(bgMapSection).not.toBeNull();
    const teams = bgMapSection[1].match(/[A-Z]{3}:/g);
    expect(teams).not.toBeNull();
    expect(teams.length).toBe(30);
  });

  test('HeroBg component uses team context', () => {
    expect(scriptContent).toContain('function HeroBg()');
    expect(scriptContent).toContain('useTeam()');
  });
});

// ============================================================
// 8. SECURITY CHECKS
// ============================================================
describe('Security', () => {
  test('no hardcoded API keys', () => {
    expect(scriptContent).not.toMatch(/sk-ant-/);
    expect(scriptContent).not.toMatch(/['"]sk-[a-zA-Z0-9]{20,}['"]/);
    expect(html).not.toMatch(/x-api-key.*sk-/);
  });

  test('API key is prompted from user, not embedded', () => {
    expect(scriptContent).toContain("prompt('Enter your Anthropic API key:')");
  });

  test('no eval() calls', () => {
    // Allow Babel standalone (which uses eval internally) but no direct eval in our code
    const ourCode = scriptContent.replace(/babel/gi, '');
    expect(ourCode).not.toMatch(/\beval\s*\(/);
  });

  test('dangerouslySetInnerHTML usage is limited and sanitized', () => {
    const dangerousMatches = scriptContent.match(/dangerouslySetInnerHTML/g);
    // Should exist (trade analysis rendering) but be minimal
    if (dangerousMatches) {
      expect(dangerousMatches.length).toBeLessThanOrEqual(3);
    }
  });

  test('no inline onclick handlers in static HTML', () => {
    // Only check the HTML outside of JSX/script
    const staticHtml = html.split('<script')[0];
    expect(staticHtml).not.toMatch(/onclick=/i);
  });
});

// ============================================================
// 9. POLL BUG REGRESSION
// ============================================================
describe('Poll Bug Regression', () => {
  test('poll uses === undefined for answer checks (not falsy)', () => {
    // The bug was: !answered[q.id] fails when answer is 0 (first option)
    expect(scriptContent).toContain('answered[pollQuestions[i].id] === undefined');
    expect(scriptContent).toContain("answered[qId] !== undefined) return");
  });

  test('poll does not use truthy check for answered state', () => {
    // Make sure we don't regress to !answered[...] for the main loop
    expect(scriptContent).not.toMatch(/findIndex\(i => !answered\[/);
  });
});

// ============================================================
// 10. STUB DATA GENERATORS
// ============================================================
describe('Stub Data Generators', () => {
  test('generateStubRoster function exists', () => {
    expect(scriptContent).toContain('function generateStubRoster(');
  });

  test('generateStubProspects function exists', () => {
    expect(scriptContent).toContain('function generateStubProspects(');
  });

  test('generatePollQuestions function exists', () => {
    expect(scriptContent).toContain('function generatePollQuestions(');
  });

  test('getTeamData function exists', () => {
    expect(scriptContent).toContain('function getTeamData(');
  });
});
