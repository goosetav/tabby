

const current = await chrome.windows.getCurrent();

// 
//   const tabIds = tabs.map(({ id }) => id);

async function merge() {
    console.log("merging...");
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
    // console.log(tab.windowId + " : " + tab.title);
        if (tab.windowId != current.id) {
            chrome.tabs.move(tab.id,{ index: -1, windowId: current.id });
        }
    }
};

async function sort() {
    console.log("sorting...");
    const tabs = await chrome.tabs.query({});

    const collator = new Intl.Collator();
    tabs.sort((a, b) => collator.compare(domain(a.url), domain(b.url)));

    for (const [idx, tab] of tabs.entries()) {
        if (!tab.pinned) {
            console.log("moving" + tab.url + " to index " + idx);
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

function domain(s) {
    let url = (new URL(s));
    return url.hostname.replace('www.', '');
}

document.querySelector("button#merge").addEventListener("click", merge);
document.querySelector("button#sort").addEventListener("click", sort);
document.querySelector("button#dedupe").addEventListener("click", dedupe);