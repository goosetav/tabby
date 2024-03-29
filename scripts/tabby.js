async function merge() {
    console.log("merging windows");
    const tabs = await chrome.tabs.query({windowType: "normal"});
    const current = await chrome.windows.getCurrent();

    const moves = [];

    for (const tab of tabs) {
        if (tab.windowId != current.id) {
            moves.push(chrome.tabs.move(tab.id,{ index: -1, windowId: current.id }));
        }
    }

    Promise.all(moves).then(updatedTabs);
};

async function sort() {
    console.log("sorting tabs");
    const tabs = await chrome.tabs.query({pinned: false, windowType: "normal"});
    const pinned = await chrome.tabs.query({pinned: true});
    const offset = pinned.length + 1;

    console.log("offset: " + offset);

    const collator = new Intl.Collator();
    tabs.sort((a, b) => collator.compare(sortkey(a.url), sortkey(b.url)));

    const moves = [];

    for (const [idx, tab] of tabs.entries()) {
        console.log("sorting: [" + (idx + offset) + "] " + tab.url);
        chrome.tabs.move(tab.id, { index: idx + offset, windowId: tab.windowId });
    }

    Promise.all(moves).then(updatedTabs);
}

async function dedupe() {
    console.log("deduping tabs");
    const tabs = await chrome.tabs.query({pinned: false, windowType: "normal"});
    const set = new Set();

    const removals = [];

    for (const tab of tabs) {
        if (!tab.pinned) {
            set.has(tab.url) ? removals.push(chrome.tabs.remove(tab.id)) : set.add(tab.url);
        }
    }

    Promise.all(removals).then(updatedTabs);
}

async function listTabs() {
    console.log("loading tab list");
    const current = await chrome.windows.getCurrent();
    const template = document.getElementById('li_template');
    const tabs = await chrome.tabs.query({windowType: "normal", windowId: current.id});

    const elements = new Set();

    for (const tab of tabs) {
        const element = template.content.firstElementChild.cloneNode(true);
        const title = tab.title;
        const faviconUrl = tab.favIconUrl || defaultFavicon;

        element.querySelector('.title').textContent = title;
        element.querySelector('img').src = faviconUrl;
        element.querySelector('a.close').addEventListener('click', async (e) => {
            chrome.tabs.remove(tab.id);
            e.target.closest("li").remove();
        });

        element.querySelector('a.open').addEventListener('click', async (e) => {
            chrome.tabs.update(tab.id, { active: true });
        });

        elements.add(element);
    }
    document.querySelector('ul').replaceChildren(...elements);
}

function sortkey(s) {
    let url = (new URL(s));
    let key = url.hostname.replace('www.', '') + "/" + url.pathname + url.search;
    return key;
}


document.querySelector("button#merge").addEventListener("click", merge);
document.querySelector("button#sort").addEventListener("click", sort);
document.querySelector("button#dedupe").addEventListener("click", dedupe);
document.addEventListener("updatedTabs", listTabs);

function updatedTabs() {
    document.dispatchEvent(new Event("updatedTabs"));
}

chrome.runtime.onMessage.addListener((request, sender, sendRespoonse) => {
    console.log("got a message => " + request.message);
    updatedTabs();
    sendRespoonse({message: "reloaded tabs"});
});

updatedTabs();

const defaultFavicon = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22439.488%22%20height%3D%22443.88%22%3E%3Cpath%20d%3D%22M219.744%20443.88c121.359%200%20219.744-99.37%20219.744-221.94C439.488%2099.368%20341.103%200%20219.744%200%2098.387%200%200%2099.368%200%20221.94c0%20122.57%2098.387%20221.94%20219.744%20221.94z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M219.744%20392.714c93.384%200%20169.086-76.459%20169.086-170.774%200-94.317-75.702-170.774-169.086-170.774-93.382%200-169.085%2076.457-169.085%20170.774%200%2094.315%2075.703%20170.774%20169.085%20170.774z%22%2F%3E%3Cpath%20d%3D%22m196.963%20300.274%2049.531-.102V261.69c0-10.438%204.866-20.3%2017.886-28.841%2013.019-8.537%2049.364-25.861%2049.364-71.409%200-45.55-38.167-76.858-70.25-83.5-32.078-6.642-66.835-2.272-91.5%2024.75-22.087%2024.197-26.741%2043.337-26.741%2085.565h49.491v-9.815c0-22.501%202.603-46.254%2034.75-52.75%2017.546-3.546%2033.994%201.958%2043.75%2011.5%2011.16%2010.912%2011.25%2035.5-6.533%2047.743l-27.896%2018.979c-16.272%2010.438-21.852%2022.059-21.852%2039.139v57.223zm-.325%2070.418v-51.005h50.212v51.005h-50.212z%22%2F%3E%3C%2Fsvg%3E";