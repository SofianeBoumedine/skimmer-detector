const cardHolderName = /card.?holder|name.*\bon\b.*card|cc.?name|cc.?full.?name|owner|karteninhaber|nombre.*tarjeta|nom.*carte|nome.*cart|名前|Имя.*карты|信用卡开户名|开户名|持卡人姓名|持卡人姓名/i;

function log(message, logType = 'log') {
    if (logType !== 'log' && logType !== 'error' && logType !== 'info' && logType !== 'warn') return;
    console[logType]('[SkimmerDetector] ', message);
}

function getPopulatedInputValues() {
    return [...document.querySelectorAll("input, textarea")].map(input => ({
        id: input.id || "",
        name: input.name || "",
        value: input.value || ""
    })).filter(input => input.value);
}

log([...document.querySelectorAll("input, textarea")]);

[...document.querySelectorAll("input, textarea")].forEach(input => {
    log(input);
    input.addEventListener('keyup', (e) => {
        log(`adding input`);
        log(e);
        chrome.runtime.sendMessage({
            type: 'sendInputValues',
            data: getPopulatedInputValues()
        });
    })
});
