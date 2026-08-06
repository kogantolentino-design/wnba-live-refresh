import fetch from "node-fetch";
import fs from "fs";

const TEAM_LOGOS = {
  "1": "https://a.espncdn.com/i/teamlogos/wnba/500/sea.png",
  "2": "https://a.espncdn.com/i/teamlogos/wnba/500/nyl.png",
  "3": "https://a.espncdn.com/i/teamlogos/wnba/500/chi.png",
  "4": "https://a.espncdn.com/i/teamlogos/wnba/500/atl.png",
  "5": "https://a.espncdn.com/i/teamlogos/wnba/500/ind.png",
  "6": "https://a.espncdn.com/i/teamlogos/wnba/500/las.png",
  "7": "https://a.espncdn.com/i/teamlogos/wnba/500/phx.png",
  "8": "https://a.espncdn.com/i/teamlogos/wnba/500/min.png",
  "9": "https://a.espncdn.com/i/teamlogos/wnba/500/dal.png",
  "10": "https://a.espncdn.com/i/teamlogos/wnba/500/was.png",
  "11": "https://a.espncdn.com/i/teamlogos/wnba/500/con.png",
  "12": "https://a.espncdn.com/i/teamlogos/wnba/500/lva.png"
};

function mapStatus(raw) {
  if (raw?.state === "in") return "LIVE";
  if (raw?.state === "post") return "FINAL";
  if (raw?.detail?.includes("Halftime")) return "HALFTIME";
  return "SCHEDULED";
}

async function main() {
  const url = "https://site.web.api.espn.com/apis/v2/sports/basketball/wnba/scoreboard";
  const res = await fetch(url);
  const data = await res.json();

  let items = "";

  for (const event of data.events) {
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
        <title>WNBA Live Refresh</title>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>
  `;

  fs.writeFileSync("feed.xml", xml.trim());
}

main();
