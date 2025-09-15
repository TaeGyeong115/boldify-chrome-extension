const {applyBoldFirstLetters, revertBoldFirstLetters} = require('../content');

describe('content.js – Boldify DOM mutations', () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <main>
        <p id="t1">Hello world! 123 apples.</p>
        <p id="t2"><code>code block stays the same</code></p>
      </main>
    `;
    });

    test('applies wrappers to the first letter of each word', () => {
        applyBoldFirstLetters(document.body);

        const marks = document.querySelectorAll('[data-bfl]');
        // Expect "Hello world! 123 apples." → H, w, 1, a (4 marks)
        expect(marks.length).toBeGreaterThanOrEqual(4);

        const firsts = Array.from(marks).map((el) => el.textContent);
        expect(firsts.some((c) => c === 'H')).toBeTruthy();
        expect(firsts.some((c) => c === 'w')).toBeTruthy();
        expect(firsts.some((c) => c === '1')).toBeTruthy();
        expect(firsts.some((c) => c === 'a')).toBeTruthy();

        // Code / pre / etc. should be skipped
        const codeHasMarks = document.querySelector('#t2 [data-bfl]');
        expect(codeHasMarks).toBeNull();
    });

    test('reverts wrappers correctly', () => {
        applyBoldFirstLetters(document.body);
        revertBoldFirstLetters(document.body);

        expect(document.querySelector('[data-bfl]')).toBeNull();
        // DOM should still contain original text after revert
        expect(document.querySelector('#t1').textContent).toContain('Hello world! 123 apples.');
    });
});
