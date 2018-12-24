const puppeteer = require('puppeteer');

puppeteer.launch({headless: false}).then(async browser => {

  const page = await browser.newPage();
  await page.goto('https://amazon.com');

  const links = await page.$$('a, button, input[type=button]');

  let bestResult = 0, bestLink = null;
  for (const link of links) {
    const attrs = await page.evaluate(link => link.getAttribute('name') + ' ' + link.getAttribute('id') + ' ' + link.getAttribute('class') + ' ' + link.getAttribute('title') + ' ' + link.getAttribute('href') + ' ' + link.innerHTML, link);
    if (containsBasketWording(attrs) > bestResult) {
      console.log(`Count: ${containsBasketWording(attrs)}, attrs: ${attrs.substring(0, 100)}`);
      bestResult = containsBasketWording(attrs);
      bestLink = link;
    }
  }

  page.mouse.click(0,0);
  bestLink.click({ clickCount: 2 });
  // If page hasn't changed. Try clicking again.

  //await browser.close();
}).catch(() => {});

function containsBasketWording(str) {
  const keywords = ['cart', 'basket', 'trolly', 'trolley', 'bag', 'checkout', 'check out'];
  const frequencies = keywords.map(keyword => countOccurrences(str.toLowerCase(), keyword));
  return frequencies.reduce((a, b) => a + b, 0);
}

function countOccurrences(haystack, needle) {
  var regExp = new RegExp(needle, "gi");
  return (haystack.match(regExp) || []).length;
}