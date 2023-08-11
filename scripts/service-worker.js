chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// when tabs change, update the sidebar
chrome.tabs.onUpdated.addListener(updateTabs);
chrome.tabs.onRemoved.addListener(updateTabs);
chrome.tabs.onAttached.addListener(updateTabs);
chrome.tabs.onDetached.addListener(updateTabs);
chrome.tabs.onMoved.addListener(updateTabs);

async function updateTabs(tabId, info, tab) {

  // const current = await chrome.windows.getCurrent();

  // if ((tab.windowId == current.id)) {
    const response = await chrome.runtime.sendMessage({
      message: "new tab(s) available"
    }).catch((error) => console.log(error));

    if (response) {
      console.log(response.message)
    }
  // }
}