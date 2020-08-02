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
            selectors.unshift(element.className.split(" ").join("."));
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
    if (selector.trim() && BIM_sessionCapture[BIM_sessionCapture.length - 1] !== selector) {
        BIM_sessionCapture.push(selector);
    }
    BIM_start = BIM_start || new Date();
}
