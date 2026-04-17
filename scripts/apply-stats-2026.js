#!/usr/bin/env node
/**
 * Apply 2025-26 season stats to all players in index.html
 * Data sourced from ESPN team stats pages (April 2026)
 */

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'index.html');

// All verified 2025-26 stats from ESPN
const STATS = {
  // BOS
  'Jaylen Brown': { ppg: 28.7, rpg: 6.9, apg: 5.1, fgPct: 47.7, threePct: 34.7, mpg: 34.4 },
  'Jayson Tatum': { ppg: 21.8, rpg: 10.0, apg: 5.3, fgPct: 41.1, threePct: 32.9, mpg: 32.6 },
  'Payton Pritchard': { ppg: 17.0, rpg: 3.9, apg: 5.2, fgPct: 46.4, threePct: 37.7, mpg: 32.4 },
  'Derrick White': { ppg: 16.5, rpg: 4.4, apg: 5.4, fgPct: 39.4, threePct: 32.7, mpg: 34.1 },
  'Neemias Queta': { ppg: 10.2, rpg: 8.4, apg: 1.7, fgPct: 65.3, threePct: 12.5, mpg: 25.3 },
  'Sam Hauser': { ppg: 9.2, rpg: 3.8, apg: 1.5, fgPct: 41.9, threePct: 39.3, mpg: 24.8 },

  // CLE
  'Donovan Mitchell': { ppg: 27.9, rpg: 4.5, apg: 5.7, fgPct: 48.3, threePct: 36.4, mpg: 33.5 },
  'Evan Mobley': { ppg: 18.2, rpg: 9.0, apg: 3.6, fgPct: 54.6, threePct: 29.7, mpg: 31.9 },
  'Darius Garland': { ppg: 18.0, rpg: 2.4, apg: 6.9, fgPct: 45.1, threePct: 36.0, mpg: 30.5 },
  'Jarrett Allen': { ppg: 15.4, rpg: 8.5, apg: 1.8, fgPct: 63.8, threePct: 10.0, mpg: 27.1 },

  // NYK
  'Jalen Brunson': { ppg: 26.0, rpg: 3.3, apg: 6.8, fgPct: 46.7, threePct: 36.9, mpg: 35.0 },
  'Karl-Anthony Towns': { ppg: 20.1, rpg: 11.9, apg: 3.0, fgPct: 50.1, threePct: 36.8, mpg: 31.0 },
  'OG Anunoby': { ppg: 16.7, rpg: 5.2, apg: 2.2, fgPct: 48.4, threePct: 38.6, mpg: 33.2 },
  'Mikal Bridges': { ppg: 14.4, rpg: 3.8, apg: 3.7, fgPct: 49.0, threePct: 37.1, mpg: 32.8 },
  'Josh Hart': { ppg: 12.0, rpg: 7.4, apg: 4.8, fgPct: 50.8, threePct: 41.3, mpg: 30.2 },
  'Mitchell Robinson': { ppg: 5.7, rpg: 8.8, apg: 0.9, fgPct: 72.3, threePct: 0, mpg: 19.6 },

  // DEN
  'Nikola Jokic': { ppg: 27.7, rpg: 12.9, apg: 10.7, fgPct: 56.9, threePct: 38.0, mpg: 34.8 },
  'Jamal Murray': { ppg: 25.4, rpg: 4.4, apg: 7.1, fgPct: 48.3, threePct: 43.5, mpg: 35.4 },
  'Aaron Gordon': { ppg: 16.2, rpg: 5.8, apg: 2.7, fgPct: 49.7, threePct: 38.9, mpg: 27.9 },
  'Christian Braun': { ppg: 12.0, rpg: 4.8, apg: 2.7, fgPct: 51.9, threePct: 30.1, mpg: 31.8 },

  // OKC
  'Shai Gilgeous-Alexander': { ppg: 31.1, rpg: 4.3, apg: 6.6, fgPct: 55.3, threePct: 38.6, mpg: 33.2 },
  'Chet Holmgren': { ppg: 17.1, rpg: 8.9, apg: 1.7, fgPct: 55.7, threePct: 36.2, mpg: 28.9 },
  'Jalen Williams': { ppg: 17.1, rpg: 4.6, apg: 5.5, fgPct: 48.4, threePct: 29.9, mpg: 28.4 },
  'Cason Wallace': { ppg: 8.6, rpg: 3.1, apg: 2.6, fgPct: 43.2, threePct: 35.1, mpg: 26.6 },
  'Luguentz Dort': { ppg: 8.3, rpg: 3.6, apg: 1.2, fgPct: 38.5, threePct: 34.4, mpg: 26.8 },
  'Isaiah Hartenstein': { ppg: 9.2, rpg: 9.4, apg: 3.5, fgPct: 62.2, threePct: 0, mpg: 24.2 },

  // DET
  'Cade Cunningham': { ppg: 23.9, rpg: 5.5, apg: 9.9, fgPct: 46.1, threePct: 34.2, mpg: 33.9 },
  'Jalen Duren': { ppg: 19.5, rpg: 10.5, apg: 2.0, fgPct: 65.0, threePct: 0, mpg: 28.2 },
  'Tobias Harris': { ppg: 13.3, rpg: 5.1, apg: 2.5, fgPct: 46.9, threePct: 36.8, mpg: 27.7 },
  'Ausar Thompson': { ppg: 9.9, rpg: 5.7, apg: 3.1, fgPct: 52.5, threePct: 25.0, mpg: 26.0 },

  // ORL
  'Paolo Banchero': { ppg: 22.2, rpg: 8.4, apg: 5.2, fgPct: 45.9, threePct: 30.5, mpg: 34.8 },
  'Franz Wagner': { ppg: 20.6, rpg: 5.2, apg: 3.3, fgPct: 48.1, threePct: 34.5, mpg: 30.0 },
  'Desmond Bane': { ppg: 20.1, rpg: 4.1, apg: 4.1, fgPct: 48.4, threePct: 39.1, mpg: 33.6 },
  'Anthony Black': { ppg: 15.0, rpg: 3.8, apg: 3.7, fgPct: 44.7, threePct: 33.3, mpg: 29.8 },
  'Jalen Suggs': { ppg: 13.8, rpg: 3.9, apg: 5.5, fgPct: 43.5, threePct: 33.9, mpg: 27.6 },
  'Wendell Carter Jr.': { ppg: 11.8, rpg: 7.4, apg: 2.0, fgPct: 51.2, threePct: 31.9, mpg: 29.3 },

  // PHI
  'Tyrese Maxey': { ppg: 28.3, rpg: 4.1, apg: 6.6, fgPct: 46.2, threePct: 36.7, mpg: 38.0 },
  'Joel Embiid': { ppg: 26.9, rpg: 7.7, apg: 3.9, fgPct: 48.9, threePct: 33.3, mpg: 31.6 },
  'Paul George': { ppg: 17.3, rpg: 5.3, apg: 3.6, fgPct: 43.9, threePct: 39.2, mpg: 30.7 },

  // ATL
  'Jalen Johnson': { ppg: 22.5, rpg: 10.3, apg: 7.9, fgPct: 48.9, threePct: 35.2, mpg: 35.2 },
  'Trae Young': { ppg: 19.3, rpg: 1.5, apg: 8.9, fgPct: 41.5, threePct: 30.5, mpg: 28.0 },
  'Onyeka Okongwu': { ppg: 15.2, rpg: 7.6, apg: 3.1, fgPct: 48.0, threePct: 37.6, mpg: 31.0 },
  'Dyson Daniels': { ppg: 11.9, rpg: 6.8, apg: 5.9, fgPct: 51.7, threePct: 18.8, mpg: 33.2 },
  'Zaccharie Risacher': { ppg: 9.6, rpg: 3.8, apg: 1.1, fgPct: 45.5, threePct: 36.8, mpg: 22.4 },

  // HOU
  'Kevin Durant': { ppg: 26.0, rpg: 5.5, apg: 4.8, fgPct: 52.0, threePct: 41.3, mpg: 36.4 },
  'Alperen Sengun': { ppg: 20.4, rpg: 8.9, apg: 6.2, fgPct: 51.9, threePct: 30.5, mpg: 33.3 },
  'Amen Thompson': { ppg: 18.3, rpg: 7.8, apg: 5.3, fgPct: 53.4, threePct: 21.6, mpg: 37.4 },
  'Jabari Smith Jr.': { ppg: 15.8, rpg: 6.9, apg: 1.9, fgPct: 44.9, threePct: 36.3, mpg: 35.1 },
  'Reed Sheppard': { ppg: 13.5, rpg: 2.9, apg: 3.4, fgPct: 43.0, threePct: 39.4, mpg: 26.2 },
  'Tari Eason': { ppg: 10.5, rpg: 6.3, apg: 1.5, fgPct: 41.6, threePct: 35.8, mpg: 25.8 },

  // LAL
  'Luka Doncic': { ppg: 33.5, rpg: 7.7, apg: 8.3, fgPct: 47.6, threePct: 36.6, mpg: 35.8 },
  'Austin Reaves': { ppg: 23.3, rpg: 4.7, apg: 5.5, fgPct: 49.0, threePct: 36.0, mpg: 34.5 },
  'LeBron James': { ppg: 20.9, rpg: 6.1, apg: 7.2, fgPct: 51.5, threePct: 31.7, mpg: 33.2 },
  'Rui Hachimura': { ppg: 11.5, rpg: 3.3, apg: 0.8, fgPct: 51.4, threePct: 44.3, mpg: 28.3 },
  'Anthony Davis': { ppg: 0, rpg: 0, apg: 0, fgPct: 0, threePct: 0, mpg: 0 }, // traded

  // SAS
  'Victor Wembanyama': { ppg: 25.0, rpg: 11.5, apg: 3.1, fgPct: 51.2, threePct: 34.9, mpg: 29.2 },
  "De'Aaron Fox": { ppg: 18.6, rpg: 3.8, apg: 6.2, fgPct: 48.6, threePct: 33.2, mpg: 31.0 },
  'Stephon Castle': { ppg: 16.7, rpg: 5.3, apg: 7.4, fgPct: 47.1, threePct: 33.2, mpg: 30.0 },
  'Devin Vassell': { ppg: 13.9, rpg: 4.0, apg: 2.5, fgPct: 43.7, threePct: 38.4, mpg: 30.5 },
  'Keldon Johnson': { ppg: 13.2, rpg: 5.4, apg: 1.4, fgPct: 51.9, threePct: 36.3, mpg: 23.3 },

  // POR
  'Deni Avdija': { ppg: 24.2, rpg: 6.9, apg: 6.7, fgPct: 46.2, threePct: 31.8, mpg: 33.3 },
  'Shaedon Sharpe': { ppg: 20.8, rpg: 4.3, apg: 2.6, fgPct: 45.2, threePct: 33.7, mpg: 29.4 },
  'Jerami Grant': { ppg: 18.6, rpg: 3.5, apg: 2.1, fgPct: 45.3, threePct: 38.9, mpg: 29.7 },
  'Scoot Henderson': { ppg: 14.2, rpg: 2.7, apg: 3.7, fgPct: 41.8, threePct: 35.2, mpg: 24.9 },
  'Donovan Clingan': { ppg: 12.1, rpg: 11.6, apg: 2.1, fgPct: 52.0, threePct: 34.1, mpg: 27.2 },

  // GSW
  'Stephen Curry': { ppg: 26.6, rpg: 3.6, apg: 4.7, fgPct: 46.8, threePct: 39.3, mpg: 30.9 },
  'Jimmy Butler': { ppg: 20.0, rpg: 5.6, apg: 4.9, fgPct: 51.9, threePct: 37.6, mpg: 31.1 },
  'Brandin Podziemski': { ppg: 13.8, rpg: 5.1, apg: 3.7, fgPct: 45.5, threePct: 37.1, mpg: 28.5 },
  'Draymond Green': { ppg: 8.4, rpg: 5.5, apg: 5.5, fgPct: 41.8, threePct: 32.6, mpg: 27.5 },

  // PHX
  'Devin Booker': { ppg: 26.1, rpg: 3.9, apg: 6.0, fgPct: 45.6, threePct: 33.0, mpg: 33.5 },
  'Dillon Brooks': { ppg: 20.2, rpg: 3.6, apg: 1.8, fgPct: 43.5, threePct: 34.4, mpg: 30.4 },
  'Grayson Allen': { ppg: 16.5, rpg: 3.0, apg: 3.8, fgPct: 40.3, threePct: 34.9, mpg: 28.8 },
  'Mark Williams': { ppg: 11.7, rpg: 8.0, apg: 1.0, fgPct: 64.4, threePct: 0, mpg: 23.6 },

  // Second batch — verified ESPN data
  // MIL
  'Giannis Antetokounmpo': { ppg: 27.6, rpg: 9.8, apg: 5.4, fgPct: 62.4, threePct: 33.3, mpg: 28.9 },
  'Kyle Kuzma': { ppg: 13.0, rpg: 4.5, apg: 2.7, fgPct: 49.2, threePct: 34.7, mpg: 26.2 },
  'Myles Turner': { ppg: 11.9, rpg: 5.3, apg: 1.5, fgPct: 44.0, threePct: 38.3, mpg: 26.9 },
  'Bobby Portis': { ppg: 13.7, rpg: 6.4, apg: 1.6, fgPct: 48.8, threePct: 45.6, mpg: 24.2 },

  // MIN
  'Anthony Edwards': { ppg: 28.8, rpg: 5.0, apg: 3.7, fgPct: 48.9, threePct: 39.9, mpg: 35.0 },
  'Julius Randle': { ppg: 21.1, rpg: 6.7, apg: 5.0, fgPct: 48.1, threePct: 31.5, mpg: 33.0 },
  'Rudy Gobert': { ppg: 10.9, rpg: 11.5, apg: 1.7, fgPct: 68.2, threePct: 0, mpg: 31.3 },
  'Jaden McDaniels': { ppg: 14.8, rpg: 4.2, apg: 2.7, fgPct: 51.5, threePct: 41.2, mpg: 31.7 },
  'Naz Reid': { ppg: 13.6, rpg: 6.2, apg: 2.2, fgPct: 45.6, threePct: 36.2, mpg: 26.1 },

  // MIA
  'Bam Adebayo': { ppg: 20.1, rpg: 10.0, apg: 3.2, fgPct: 44.2, threePct: 31.8, mpg: 32.4 },
  'Tyler Herro': { ppg: 20.5, rpg: 4.8, apg: 4.1, fgPct: 48.0, threePct: 37.8, mpg: 31.3 },

  // IND
  'Pascal Siakam': { ppg: 24.0, rpg: 6.6, apg: 3.8, fgPct: 48.4, threePct: 35.8, mpg: 33.2 },
  'Tyrese Haliburton': { ppg: 16.9, rpg: 2.8, apg: 7.7, fgPct: 44.2, threePct: 36.1, mpg: 31.3 },

  // DAL
  'Cooper Flagg': { ppg: 21.0, rpg: 6.7, apg: 4.5, fgPct: 46.8, threePct: 29.5, mpg: 33.5 },
  'Anthony Davis': { ppg: 20.4, rpg: 11.1, apg: 2.8, fgPct: 50.6, threePct: 27.0, mpg: 31.3 },
  'PJ Washington': { ppg: 14.2, rpg: 7.0, apg: 1.8, fgPct: 45.0, threePct: 32.5, mpg: 31.0 },
  'Klay Thompson': { ppg: 11.7, rpg: 2.1, apg: 1.4, fgPct: 39.3, threePct: 38.3, mpg: 21.7 },
  'Daniel Gafford': { ppg: 9.5, rpg: 6.9, apg: 1.1, fgPct: 65.5, threePct: 0, mpg: 21.7 },

  // MEM
  'Ja Morant': { ppg: 19.5, rpg: 3.3, apg: 8.1, fgPct: 41.0, threePct: 23.5, mpg: 28.5 },
  'Jaren Jackson Jr.': { ppg: 19.2, rpg: 5.8, apg: 1.9, fgPct: 47.5, threePct: 35.9, mpg: 30.7 },

  // TOR
  'Scottie Barnes': { ppg: 18.1, rpg: 7.5, apg: 5.9, fgPct: 50.7, threePct: 30.4, mpg: 33.5 },
  'RJ Barrett': { ppg: 19.3, rpg: 5.3, apg: 3.3, fgPct: 49.1, threePct: 33.9, mpg: 30.3 },
  'Immanuel Quickley': { ppg: 16.4, rpg: 4.0, apg: 5.9, fgPct: 44.3, threePct: 37.4, mpg: 31.9 },
  'Jakob Poeltl': { ppg: 10.7, rpg: 7.0, apg: 2.0, fgPct: 70.0, threePct: 0, mpg: 25.0 },

  // SAC
  'DeMar DeRozan': { ppg: 18.4, rpg: 2.9, apg: 4.1, fgPct: 49.7, threePct: 32.0, mpg: 31.2 },
  'Domantas Sabonis': { ppg: 15.8, rpg: 11.4, apg: 4.1, fgPct: 54.3, threePct: 18.5, mpg: 29.7 },

  // CHA
  'LaMelo Ball': { ppg: 20.1, rpg: 4.8, apg: 7.1, fgPct: 40.7, threePct: 36.8, mpg: 28.0 },
  'Brandon Miller': { ppg: 20.2, rpg: 4.9, apg: 3.3, fgPct: 43.5, threePct: 38.3, mpg: 30.3 },
  'Miles Bridges': { ppg: 17.1, rpg: 5.8, apg: 3.2, fgPct: 46.0, threePct: 33.3, mpg: 31.0 },

  // WAS
  'Bilal Coulibaly': { ppg: 11.7, rpg: 4.3, apg: 2.6, fgPct: 42.5, threePct: 31.9, mpg: 26.2 },
  'Jordan Poole': { ppg: 13.4, rpg: 2.0, apg: 3.1, fgPct: 37.2, threePct: 33.3, mpg: 23.9 },

  // BKN
  'Cam Thomas': { ppg: 15.6, rpg: 1.8, apg: 3.1, fgPct: 39.9, threePct: 32.5, mpg: 24.3 },
  'Nic Claxton': { ppg: 11.7, rpg: 6.9, apg: 3.7, fgPct: 57.1, threePct: 15.8, mpg: 27.8 },

  // LAC
  'Kawhi Leonard': { ppg: 27.9, rpg: 6.4, apg: 3.6, fgPct: 50.5, threePct: 38.7, mpg: 32.1 },
  'James Harden': { ppg: 25.4, rpg: 4.8, apg: 8.1, fgPct: 41.9, threePct: 34.7, mpg: 35.4 },

  // NOP
  'Zion Williamson': { ppg: 21.0, rpg: 5.7, apg: 3.2, fgPct: 60.0, threePct: 25.0, mpg: 29.7 },
  'Trey Murphy III': { ppg: 21.5, rpg: 5.7, apg: 3.8, fgPct: 47.0, threePct: 37.9, mpg: 35.5 },

  // CHI
  'Josh Giddey': { ppg: 17.0, rpg: 8.3, apg: 9.1, fgPct: 44.8, threePct: 36.4, mpg: 32.1 },
  'Matas Buzelis': { ppg: 16.3, rpg: 5.8, apg: 2.1, fgPct: 46.3, threePct: 34.9, mpg: 29.2 },
};

function updatePlayer(html, name, stats) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `(name:\\s*["']${escaped}["'][^}]*stats:\\s*\\{)([^}]+)(\\})`,
    's'
  );
  const match = html.match(pattern);
  if (!match) return { html, updated: false };

  // Preserve tsPct if exists
  const oldTsPct = match[2].match(/tsPct:\s*([\d.]+)/);
  const tsPct = oldTsPct ? parseFloat(oldTsPct[1]) : 0;

  const newStats = ` ppg: ${stats.ppg}, rpg: ${stats.rpg}, apg: ${stats.apg}, fgPct: ${stats.fgPct}, threePct: ${stats.threePct}, tsPct: ${tsPct}, mpg: ${stats.mpg} `;
  return { html: html.replace(pattern, `$1${newStats}$3`), updated: true };
}

// Run
let html = fs.readFileSync(INDEX_PATH, 'utf-8');
let updated = 0, skipped = 0;

for (const [name, stats] of Object.entries(STATS)) {
  if (stats.ppg === 0) continue; // skip traded/injured players with no stats
  const result = updatePlayer(html, name, stats);
  if (result.updated) {
    html = result.html;
    updated++;
    console.log(`✓ ${name}: ${stats.ppg} PPG`);
  } else {
    skipped++;
  }
}

console.log(`\nUpdated: ${updated}, Skipped: ${skipped}`);
fs.writeFileSync(INDEX_PATH, html);
console.log('Wrote to index.html');
