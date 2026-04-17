#!/usr/bin/env node
/**
 * NBA Vault — Auto-Update Player Stats
 *
 * Fetches current season stats from ESPN for all 30 teams
 * and updates the player stats in index.html.
 *
 * Usage:
 *   node scripts/update-stats.js           # Update all teams
 *   node scripts/update-stats.js UTA       # Update one team
 *   node scripts/update-stats.js --dry-run # Preview without writing
 *
 * Data source: ESPN team stats pages (public, no key required)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const INDEX_PATH = path.join(__dirname, '..', 'index.html');

// ESPN team ID mapping (numeric)
const ESPN_IDS = {
  ATL: 1, BOS: 2, BKN: 17, CHA: 30, CHI: 4, CLE: 5, DAL: 6, DEN: 7,
  DET: 8, GSW: 9, HOU: 10, IND: 11, LAC: 12, LAL: 13, MEM: 29, MIA: 14,
  MIL: 15, MIN: 16, NOP: 3, NYK: 18, OKC: 25, ORL: 19, PHI: 20, PHX: 21,
  POR: 22, SAC: 23, SAS: 24, TOR: 28, UTA: 26, WAS: 27,
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error from ${url}`)); }
      });
    }).on('error', reject);
  });
}

async function fetchTeamStats(abbr) {
  const teamId = ESPN_IDS[abbr];
  if (!teamId) return null;

  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`;

  try {
    const data = await fetchJson(url);
    const athletes = data.athletes || [];
    const players = [];

    for (const group of athletes) {
      for (const athlete of (group.items || [])) {
        const name = athlete.displayName || athlete.fullName;
        // Try to get stats from the athlete object
        if (athlete.statistics) {
          const stats = {};
          for (const cat of athlete.statistics) {
            if (cat.name === 'avgPoints') stats.ppg = parseFloat(cat.displayValue) || 0;
            if (cat.name === 'avgRebounds') stats.rpg = parseFloat(cat.displayValue) || 0;
            if (cat.name === 'avgAssists') stats.apg = parseFloat(cat.displayValue) || 0;
            if (cat.name === 'avgMinutes') stats.mpg = parseFloat(cat.displayValue) || 0;
          }
          if (stats.ppg > 0) players.push({ name, ...stats });
        }
      }
    }

    return players;
  } catch (e) {
    console.error(`  ESPN roster API failed for ${abbr}: ${e.message}`);

    // Fallback: try the core API
    try {
      const coreUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}?enable=roster,stats`;
      const data = await fetchJson(coreUrl);
      console.log(`  Fallback API returned ${Object.keys(data).length} keys`);
      return null;
    } catch (e2) {
      return null;
    }
  }
}

function updatePlayerInHtml(html, playerName, newStats) {
  const escaped = playerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `(name:\\s*["']${escaped}["'][^}]*stats:\\s*\\{)([^}]+)(\\})`,
    's'
  );

  const match = html.match(pattern);
  if (!match) return { html, updated: false };

  // Preserve existing tsPct if we don't have a new one
  const oldStats = match[2];
  const oldTsPct = oldStats.match(/tsPct:\s*([\d.]+)/);
  const tsPct = newStats.tsPct || (oldTsPct ? parseFloat(oldTsPct[1]) : 0);

  const finalStats = ` ppg: ${newStats.ppg}, rpg: ${newStats.rpg}, apg: ${newStats.apg}, fgPct: ${newStats.fgPct || 0}, threePct: ${newStats.threePct || 0}, tsPct: ${tsPct}, mpg: ${newStats.mpg || 0} `;

  const updated = html.replace(pattern, `$1${finalStats}$3`);
  return { html: updated, updated: updated !== html };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetTeam = args.find(a => !a.startsWith('--'))?.toUpperCase();

  console.log('NBA Vault — Stats Updater');
  console.log('========================');
  if (dryRun) console.log('DRY RUN — no files will be modified\n');

  let html = fs.readFileSync(INDEX_PATH, 'utf-8');
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  const teams = targetTeam ? [targetTeam] : Object.keys(ESPN_IDS);

  for (const abbr of teams) {
    console.log(`\nFetching ${abbr}...`);
    const players = await fetchTeamStats(abbr);

    if (!players || players.length === 0) {
      console.log(`  No stats returned`);
      totalFailed++;
      continue;
    }

    console.log(`  Found ${players.length} players with stats`);

    for (const player of players) {
      const result = updatePlayerInHtml(html, player.name, player);
      if (result.updated) {
        html = result.html;
        totalUpdated++;
        console.log(`  ✓ ${player.name}: ${player.ppg} PPG, ${player.rpg} RPG, ${player.apg} APG`);
      } else {
        totalSkipped++;
      }
    }

    // Rate limit between teams
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n========================`);
  console.log(`Updated: ${totalUpdated} players`);
  console.log(`Skipped: ${totalSkipped} (not in roster or unchanged)`);
  console.log(`Failed:  ${totalFailed} teams`);

  if (!dryRun && totalUpdated > 0) {
    fs.writeFileSync(INDEX_PATH, html);
    console.log(`\nWrote changes to ${INDEX_PATH}`);
    console.log('Next: npm test && git add index.html && git commit -m "Update player stats"');
  } else if (dryRun) {
    console.log('\nDry run — no files modified');
  } else {
    console.log('\nNo updates needed');
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
