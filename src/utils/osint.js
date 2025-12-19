/**
 * Google Dork Builder
 * Generates search URLs based on input keywords and modifiers.
 */
export const buildDorks = (input) => {
  const domain = input.match(/site:(\S+)/)?.[1] || "";
  const filetype = input.match(/filetype:(\S+)/)?.[1] || "";
  const keywords = input
    .replace(/site:\S+/, "")
    .replace(/filetype:\S+/, "")
    .trim();

  // Base query parts
  const qBase = keywords ? `"${keywords}"` : "";
  const qDomain = domain ? `site:${domain}` : "";
  const qType = filetype ? `filetype:${filetype}` : "";

  // Common sensitive file extentions if not specified
  const extList = ["pdf", "docx", "xlsx", "sql", "db", "log", "env"];

  const dorks = [
    {
      name: "General Search",
      query: `${qBase} ${qDomain} ${qType}`.trim(),
    },
    {
      name: "Exposed Directories",
      query: `${qDomain} intitle:"index of" "parent directory" ${qBase}`.trim(),
    },
    {
      name: "Config Files",
      query: `${qDomain} ext:xml | ext:conf | ext:cnf | ext:reg | ext:inf | ext:rdp | ext:cfg | ext:txt | ext:ini | ext:env ${qBase}`.trim(),
    },
    {
      name: "Database Files",
      query: `${qDomain} ext:sql | ext:dbf | ext:mdb ${qBase}`.trim(),
    },
    {
      name: "Log Files",
      query: `${qDomain} ext:log ${qBase}`.trim(),
    },
    {
      name: "Backup Files",
      query: `${qDomain} ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup ${qBase}`.trim(),
    },
    {
      name: "Login Pages",
      query: `${qDomain} inurl:login | inurl:signin | intitle:Login | intitle:"sign in" | inurl:auth ${qBase}`.trim(),
    },
  ];

  return dorks
    .filter((d) => d.query.length > 5)
    .map(
      (d) =>
        `[${d.name}]\nhttps://www.google.com/search?q=${encodeURIComponent(
          d.query
        )}`
    )
    .join("\n\n");
};

/**
 * Username Recon (Sherlock Lite)
 * Checks visibility of profiles on popular platforms.
 * Note: Client-side CORS limitations apply. We mostly generate links or try Image based checks if possible.
 * For now, we generate a verified list of profile URLs to check manually.
 */
export const searchUsername = (username) => {
  if (!username) return "Please enter a username.";
  
  const sites = [
    { name: "GitHub", url: `https://github.com/${username}` },
    { name: "Twitter", url: `https://twitter.com/${username}` },
    { name: "Instagram", url: `https://instagram.com/${username}` },
    { name: "Facebook", url: `https://facebook.com/${username}` },
    { name: "Reddit", url: `https://reddit.com/user/${username}` },
    { name: "TikTok", url: `https://tiktok.com/@${username}` },
    { name: "Medium", url: `https://medium.com/@${username}` },
    { name: "Pinterest", url: `https://pinterest.com/${username}` },
    { name: "GitLab", url: `https://gitlab.com/${username}` },
    { name: "BitBucket", url: `https://bitbucket.org/${username}` },
    { name: "Dev.to", url: `https://dev.to/${username}` },
    { name: "SoundCloud", url: `https://soundcloud.com/${username}` },
    { name: "Telegram", url: `https://t.me/${username}` },
    { name: "YouTube", url: `https://youtube.com/@${username}` },
    { name: "Wikipedia", url: `https://en.wikipedia.org/wiki/User:${username}` },
  ];

  let output = `[Target: ${username}]\n\nClick links to verify:\n`;
  sites.forEach((site) => {
    output += `- ${site.name}: ${site.url}\n`;
  });
  
  return output;
};
