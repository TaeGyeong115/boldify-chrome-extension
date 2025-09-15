const MARK = "data-bfl";

function injectBflStyle(root = document) {
    if (root.getElementById('bfl-style')) return;
    const style = document.createElement('style');
    style.id = 'bfl-style';
    style.textContent = `[${MARK}]{ font-weight: 700 !important; }`;
    document.documentElement.appendChild(style);
}

function applyBoldFirstLetters(root = document.body) {
    injectBflStyle(document);

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
        const html = node.nodeValue.replace(
            /([\p{L}\p{N}])([\p{L}\p{N}_-]*)/gu,
            (_, first, rest) => `<span ${MARK}>${first}</span>${rest}`
        );
        if (html === node.nodeValue) return;
        const span = document.createElement("span");
        span.innerHTML = html;
        node.replaceWith(...span.childNodes);
    });
}

function revertBoldFirstLetters(root = document.body) {
    root.querySelectorAll(`[${MARK}]`).forEach(el => {
        const text = document.createTextNode(el.textContent || "");
        el.replaceWith(text);
    });
    root.normalize();
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "APPLY") applyBoldFirstLetters();
    if (msg?.type === "REVERT") revertBoldFirstLetters();
});

if (typeof module !== 'undefined') {
    module.exports = { applyBoldFirstLetters, revertBoldFirstLetters };
}