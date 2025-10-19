(function() {
  // Read settings from the <script> tag (optional, can be extended later)
  const scriptTag = document.currentScript;
  const command = (scriptTag.getAttribute("data-command") || "!fgoal").toLowerCase();
  const labelText = scriptTag.getAttribute("data-label") || "Followers:";
  const fontFamily = scriptTag.getAttribute("data-font") || "Nunito, sans-serif";
  const fontSize = parseInt(scriptTag.getAttribute("data-size") || "48", 10);
  const fontColor = scriptTag.getAttribute("data-color") || "#ffffff";
  const align = scriptTag.getAttribute("data-align") || "center";
  const refreshSec = parseInt(scriptTag.getAttribute("data-refresh") || "30", 10);
  let goal = parseInt(scriptTag.getAttribute("data-default-goal") || "100", 10);
  let currentFollowers = 0;

  // Build container
  const container = document.createElement("div");
  container.id = "follower-goal";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = align === "left" ? "flex-start" : (align === "right" ? "flex-end" : "center");
  container.style.fontFamily = fontFamily;
  container.style.fontSize = fontSize + "px";
  container.style.color = fontColor;
  container.style.textShadow = "rgb(0, 0, 0) 1px 1px 1px";
  container.style.whiteSpace = "nowrap";
  container.style.overflow = "hidden";

  const labelSpan = document.createElement("span");
  labelSpan.style.fontWeight = "600";
  labelSpan.style.marginRight = "8px";
  labelSpan.textContent = labelText;

  const valueSpan = document.createElement("span");
  valueSpan.style.fontWeight = "700";
  valueSpan.textContent = "0/" + goal;

  container.appendChild(labelSpan);
  container.appendChild(valueSpan);
  document.body.appendChild(container);

  // Update display
  function updateDisplay() {
    valueSpan.textContent = `${currentFollowers}/${goal}`;
  }

  // Fetch followers from StreamElements channel context
  async function fetchFollowers() {
    try {
      const channelId = SE_API?.channel?._id;
      if (!channelId) return;
      const res = await fetch(`https://api.streamelements.com/kappa/v2/channels/${channelId}`);
      if (!res.ok) throw new Error("SE API error " + res.status);
      const data = await res.json();
      currentFollowers = data?.stats?.followers ?? 0;
      updateDisplay();
    } catch (e) {
      console.warn("Follower fetch failed:", e.message);
    }
  }

  // Listen for chat messages (mods can change goal)
  window.addEventListener("onEventReceived", function (obj) {
    const listener = obj.detail?.listener;
    const event = obj.detail?.event;
    if (listener !== "message" || !event?.data?.text) return;

    const text = event.data.text.trim();
    if (!text.toLowerCase().startsWith(command)) return;

    // Command format: !fgoal 200
    const parts = text.split(/\s+/);
    const newGoal = parseInt(parts[1], 10);
    if (Number.isFinite(newGoal) && newGoal > 0) {
      goal = newGoal;
      updateDisplay();
    }
  });

  // Start
  fetchFollowers();
  setInterval(fetchFollowers, refreshSec * 1000);
})();
