let BIM_sessionCapture = [];
let BIM_verbose = true;
let BIM_start;

/**
 * Climbs up the parents until we find an id or a href, and gets the selectors
 * @param element
 * @param selectors
 * @returns {*}
 * @constructor
 */
let BIM_climbUp = (element, selectors) => {
    if (element) {
        if (element.id) {
            selectors.unshift(`#${element.id}`);
            return selectors;
        } else if (element.href) {
            selectors.unshift(`a[href="${element.href}"]`);
            return selectors;
        } else if (element.className) {
            selectors.unshift('.' + element.className
                .split(" ")
                .filter(Boolean)
                .join(".")
            );
        } else if (element.name) {
            selectors.unshift(`input[name="${element.name}"]`);
        }

        if(element.parentElement) {
            return BIM_climbUp(element.parentElement, selectors);
        }
    }
    return selectors;
}
/**
 * Copies the session to the clipboard
 * @constructor
 */
let BIM_extractSession = () => {
    copy([
        `Started ${BIM_start.toISOString()}`,
        ...BIM_sessionCapture,
        `Ended ${new Date().toISOString()}`,
    ].join('\r\n'));
    console.log(`The session has ben copied to your clipboard`);
}
/**
 * Copies the session as Puppeteer steps to the clipboard
 * @constructor
 */
let BIM_extractSessionForPuppeteer = () => {
    const session = [
        `// Started ${BIM_start.toISOString()}`,
    ];

    let currentWord = '';
    let currentWordSelector = '';
    let ignoreKeyUp = false;
    for (const sessionElement of BIM_sessionCapture) {
        if (sessionElement.type === 'click') {
            if (currentWord) {
                session.push(`await page.waitForSelector('${currentWordSelector}');`);
                session.push(`await page.type('${currentWordSelector}', '${currentWord}', {delay: 20});`);
                session.push(``);
                currentWord = '';
                currentWordSelector = '';
            }
            if (currentWordSelector !== sessionElement.selector) {
                currentWord = '';
                currentWordSelector = '';
            }
            session.push(`await page.waitForSelector('${sessionElement.selector}');`);
            session.push(`await page.click('${sessionElement.selector}');`);
            session.push(``);
        } else if (sessionElement.type === 'keydown') {
            if (sessionElement.key.length === 1) {
                currentWordSelector = sessionElement.selector;
                currentWord += sessionElement.key;
            } else {
                if (currentWord) {
                    session.push(`await page.waitForSelector('${currentWordSelector}');`);
                    session.push(`await page.type('${currentWordSelector}', '${currentWord}', {delay: 20});`);
                    session.push(``);
                    currentWord = '';
                    currentWordSelector = '';
                }
                session.push(`await page.keyboard.press('${sessionElement.key}');`);
            }
        }
    }

    session.push(`// Ended ${new Date().toISOString()}`);

    copy(session.map(l => s ? '\t' + s : s).join('\r\n'));
    console.log(`The session has ben copied to your clipboard`);
}
/**
 * Clears the selectors that have been captured so far
 * @constructor
 */
let BIM_restartSession = () => {
    BIM_sessionCapture = [];
    BIM_start = BIM_start || new Date();
    console.log(`The session has been restarted`);
}

window.onclick = (event) => {
    const [x, y] = [event.clientX, event.clientY];
    const elementMouseIsOver = document.elementFromPoint(x, y);
    let selectors = [];
    const selectorsArray = BIM_climbUp(elementMouseIsOver, selectors);
    const selector = selectorsArray.join(' ');
    if (BIM_verbose) {
        if (selector.trim()) {
            console.log(`Clicked on: ${selector}`);
        }
    }
    const previous = BIM_sessionCapture[BIM_sessionCapture.length - 1] || {};
    if (selector.trim() && previous.selector !== selector && previous.type !== 'click') {
        BIM_sessionCapture.push({
            type: 'click',
            selector
        });
    }
    BIM_start = BIM_start || new Date();
}

window.onkeyup = (event) => {
    let selectors = [];
    const selectorsArray = BIM_climbUp(event.target, selectors);
    const selector = selectorsArray.join(' ');
    if (BIM_verbose) {
        if (selector.trim()) {
            console.log(`Key Up ${event.key} on: ${selector}`);
        }
    }
    BIM_sessionCapture.push({
        key: event.key,
        type: 'keyup',
        selector
    });
    BIM_start = BIM_start || new Date();
}
window.onkeydown = (event) => {
    let selectors = [];
    const selectorsArray = BIM_climbUp(event.target, selectors);
    const selector = selectorsArray.join(' ');
    if (BIM_verbose) {
        if (selector.trim()) {
            console.log(`Key Up ${event.key} on: ${selector}`);
        }
    }
    BIM_sessionCapture.push({
        key: event.key,
        type: 'keydown',
        selector
    });
    BIM_start = BIM_start || new Date();
}
