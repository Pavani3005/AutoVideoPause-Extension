let previousTabId = null;
let tabStates = new Map();

// Handle tab switches
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await handleVideoState(previousTabId, 'pause');
    await handleVideoState(activeInfo.tabId, 'resume');
    previousTabId = activeInfo.tabId;
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Chrome window lost focus - pause videos
        if (activeTab) {
            await handleVideoState(activeTab.id, 'pause');
        }
    } else {
        // Chrome window gained focus - resume videos
        if (activeTab) {
            await handleVideoState(activeTab.id, 'resume');
        }
    }
});

// Handle window closing
chrome.windows.onRemoved.addListener(async (windowId) => {
    const tabs = await chrome.tabs.query({ windowId });
    for (const tab of tabs) {
        await handleVideoState(tab.id, 'pause');
    }
});

async function handleVideoState(tabId, action) {
    if (!tabId) return;

    // Check if extension is enabled
    const { isEnabled = true } = await chrome.storage.local.get('isEnabled');
    if (!isEnabled) return;

    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(
                tabId,
                { action: action + 'Videos' },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(`Error in tab ${tabId}:`, chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    console.log(`Videos ${action}d in tab:`, tabId);
                    resolve(response);
                }
            );
        });
    } catch (error) {
        console.error(`Failed to ${action} videos:`, error);
    }
}