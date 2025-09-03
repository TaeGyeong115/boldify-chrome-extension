const MARK = "data-bfl";

function applyBoldFirstLetters(root = document.body) {
    const SKIP = new Set(["SCRIPT","STYLE","NOSCRIPT","CODE","PRE","TEXTAREA","INPUT"]);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node){
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            const p = node.parentElement;
            if (!p || SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
            if (p.closest(`[${MARK}]`)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        const html = node.nodeValue.replace(/(\p{L}|\p{N})/u, (m) => `<span ${MARK}>${m}</span>`);
        if (html === node.nodeValue) return;
        const span = document.createElement("span");
        span.innerHTML = html;
        node.replaceWith(...span.childNodes);
    });
}

function revertBoldFirstLetters(root = document.body) {
    document.querySelectorAll(`[${MARK}]`).forEach(el => {
        const text = document.createTextNode(el.textContent || "");
        el.replaceWith(text);
    });
    root.normalize();
}

(async function initOnLoad(){
    try {
        const [{ id: tabId }] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabId) return;
        const store = await chrome.storage.local.get(`tab-${tabId}`);
        if (store[`tab-${tabId}`]) applyBoldFirstLetters();
    } catch (_) {}
})();

chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "APPLY") applyBoldFirstLetters();
    if (msg?.type === "REVERT") revertBoldFirstLetters();
});

if (typeof module !== 'undefined') {
    module.exports = { applyBoldFirstLetters, revertBoldFirstLetters };
}