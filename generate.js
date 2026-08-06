import RSS from "rss";
import fs from "fs";

const url = "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard";
const data = await fetch(url).then(r => r.json());

// Try both ESPN paths
const events = data.events?.length ? data.events : data.leagues?.[0]?.events || [];

const feed = new RSS({
  title: "WNBA Live Scoreboard",
  description: "Auto-updating WNBA scoreboard feed",
  feed_url: "https://kogantolentino-design.github.io/wnba-live-refresh/feed.xml",
  site_url: "https://www.wnba.com"
});

// Fallback if ESPN returns nothing
if (events.length === 0) {
  feed.item({
    title: "No WNBA games right now",
    description: "Waiting for next scheduled game",
    date: new Date()
  });

  fs.writeFileSync("feed.xml", feed.xml({ indent: true }));
  process.exit(0);
}

for (const game of events) {
  const comp = game.competitions[0];

  const home = comp.competitors.find(c => c.homeAway === "home");
  const away = comp.competitors.find(c => c.homeAway === "away");

  feed.item({
    title: `${away.team.displayName} ${away.score ?? ""} - ${home.score ?? ""} ${home.team.displayName}`,
    description: game.status.type.detail,
    date: new Date(game.date),
    custom_elements: [
      { homeLogo: home.team.logo },
      { awayLogo: away.team.logo }
    ]
  });
}

fs.writeFileSync("feed.xml", feed.xml({ indent: true }));
