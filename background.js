const key = (tabId) => `tab-${tabId}`;

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab?.id) return;

    const store = await chrome.storage.local.get(key(tab.id));
    const enabled = !store[key(tab.id)];

    await chrome.storage.local.set({ [key(tab.id)]: enabled });

    await chrome.action.setBadgeText({ tabId: tab.id, text: enabled ? "ON" : "" });
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#000" });

    chrome.tabs.sendMessage(tab.id, { type: enabled ? "APPLY" : "REVERT" });
});
