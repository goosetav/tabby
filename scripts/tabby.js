async function merge() {
    console.log("merging...");
    const tabs = await chrome.tabs.query({windowType: "normal"});
    const current = await chrome.windows.getCurrent();

    for (const tab of tabs) {
        if (tab.windowId != current.id) {
            chrome.tabs.move(tab.id,{ index: -1, windowId: current.id });
        }
    }
};

async function sort() {
    console.log("sorting...");
    const tabs = await chrome.tabs.query({pinned: false, windowType: "normal"});
    const pinned = await chrome.tabs.query({pinned: true});
    const offset = pinned.length + 1;

    console.log("offset: " + offset);

    const collator = new Intl.Collator();
    tabs.sort((a, b) => collator.compare(sortkey(a.url), sortkey(b.url)));

    for (const [idx, tab] of tabs.entries()) {
        console.log("sorting: [" + (idx + offset) + "] " + tab.url);
        chrome.tabs.move(tab.id, { index: idx + offset, windowId: tab.windowId });
    }
}

async function dedupe() {
    console.log("dedupe...");
    const tabs = await chrome.tabs.query({pinned: false, windowType: "normal"});
    const set = new Set();

    for (const tab of tabs) {
        if (!tab.pinned) {
            set.has(tab.url) ? chrome.tabs.remove(tab.id) : set.add(tab.url);
        }
    }
}

function sortkey(s) {
    let url = (new URL(s));
    let key = url.hostname.replace('www.', '') + "/" + url.pathname + url.search;
    return key;
}

document.querySelector("button#merge").addEventListener("click", merge);
document.querySelector("button#sort").addEventListener("click", sort);
document.querySelector("button#dedupe").addEventListener("click", dedupe);