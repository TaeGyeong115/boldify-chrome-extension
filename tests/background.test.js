describe('background.js – toggle & messaging', () => {
    beforeEach(() => {
        jest.resetModules();
        // Clean stored values between tests
        chrome.storage.local.get.mockImplementation(async (keys) => ({}));
        chrome.storage.local.set.mockResolvedValue();
        chrome.action.setBadgeText.mockResolvedValue();
        chrome.action.setBadgeBackgroundColor.mockResolvedValue();
        chrome.tabs.sendMessage.mockResolvedValue();
    });

    test('click toggles ON then OFF, updates badge and sends messages', async () => {
        require('./background');

        // Grab the onClicked listener function
        const listener = chrome.action.onClicked.addListener.mock.calls[0][0];

        // Simulate a click (tab.id = 1) → turns ON
        await listener({ id: 1 });
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'tab-1': true });
        expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: 'ON' });
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { type: 'APPLY' });

        // Now storage.get returns enabled true
        chrome.storage.local.get.mockResolvedValueOnce({ 'tab-1': true });

        // Second click → turns OFF
        await listener({ id: 1 });
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'tab-1': false });
        expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: '' });
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { type: 'REVERT' });
    });
});
