import fetch from "node-fetch";
import fs from "fs";

const SCOREBOARD_URL =
  "https://site.web.api.espn.com/apis/v2/sports/basketball/wnba/scoreboard";

const TEAM_LOGOS = {
  "1": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/atl.png",
  "2": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/chi.png",
  "3": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/con.png",
  "4": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/dal.png",
  "5": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/ind.png",
  "6": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/las.png",
  "7": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/min.png",
  "8": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/ny.png",
  "9": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/phx.png",
  "10": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/sea.png",
  "11": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/wsh.png",
  "12": "https://a.espncdn.com/i/teamlogos/basketball/500/scoreboard/lva.png"
};

function mapStatus(status) {
  if (!status) return "Unknown";

  if (status.type?.state === "pre") {
    return `Scheduled - ${status.type?.shortDetail || ""}`;
  }

  if (status.type?.state === "in") {
    return `LIVE - ${status.type?.shortDetail || ""}`;
  }

  if (status.type?.state === "post") {
    return `Final - ${status.type?.shortDetail || ""}`;
  }

  return status.type?.shortDetail || "Unknown";
}

async function main() {
  const response = await fetch(SCOREBOARD_URL);
  const data = await response.json();

  // FIX: ESPN sometimes uses leagues[0].events instead of data.events
  const events = data?.events || data?.leagues?.[0]?.events || [];

  let items = "";

  for (const event of events) {
    const c = event.competitions[0];

    const home = c.competitors.find(t => t.homeAway === "home");
    const away = c.competitors.find(t => t.homeAway === "away");

    const homeTeam = home.team.shortDisplayName;
    const awayTeam = away.team.shortDisplayName;

    const homeScore = home.score;
    const awayScore = away.score;

    const status = mapStatus(c.status);

    const homeLogo = TEAM_LOGOS[home.team.id] || "";
    const awayLogo = TEAM_LOGOS[away.team.id] || "";

    items += `
      <item>
        <title>${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}</title>
        <description>${status}</description>
        <homeLogo>${homeLogo}</homeLogo>
        <awayLogo>${awayLogo}</awayLogo>
      </item>
    `;
  }

  const xml = `
    <rss version="2.0">
      <channel>
        <title>WNBA Live Scoreboard</title>
        <description>Auto-updating WNBA scoreboard feed</description>
        ${items}
      </channel>
    </rss>
  `;

  fs.writeFileSync("feed.xml", xml.trim());
}

main();
