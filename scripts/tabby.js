async function merge() {
    console.log("merging...");
    const tabs = await chrome.tabs.query({});
    const current = await chrome.windows.getCurrent();

    for (const tab of tabs) {
        if (tab.windowId != current.id) {
            chrome.tabs.move(tab.id,{ index: -1, windowId: current.id });
        }
    }
};

async function sort() {
    console.log("sorting...");
    const tabs = await chrome.tabs.query({});

    const collator = new Intl.Collator();
    tabs.sort((a, b) => collator.compare(sortkey(a.url), sortkey(b.url)));

    for (const [idx, tab] of tabs.entries()) {
        if (!tab.pinned) {
            chrome.tabs.move(tab.id, { index: idx+1, windowId: tab.windowId });
        }
    }
}

async function dedupe() {
    console.log("dedupe...");
    const tabs = await chrome.tabs.query({});
    const set = new Set();

    for (const tab of tabs) {
        if (!tab.pinned) {
            set.has(tab.url) ? chrome.tabs.remove(tab.id) : set.add(tab.url);
        }
    }
}

function sortkey(s) {
    let url = (new URL(s));
    return url.hostname.replace('www.', '') + "/" + url.pathname + url.search
}

document.querySelector("button#merge").addEventListener("click", merge);
document.querySelector("button#sort").addEventListener("click", sort);
document.querySelector("button#dedupe").addEventListener("click", dedupe);