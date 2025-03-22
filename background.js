let previousTabId = null;
let tabStates = new Map();

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log("Tab changed. Current tab:", activeInfo.tabId);
    
    // Add a small delay to ensure content scripts are properly loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Pause videos in the previous tab
    if (previousTabId !== null) {
        console.log("Attempting to pause videos in previous tab:", previousTabId);
        try {
            await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(
                    previousTabId,
                    { action: "pauseVideos" },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error:", chrome.runtime.lastError.message);
                            reject(chrome.runtime.lastError);
                            return;
                        }
                        console.log("Videos paused in previous tab:", previousTabId);
                        resolve(response);
                    }
                );
            });
        } catch (error) {
            console.error("Failed to pause videos:", error);
        }
    }

    // Resume videos in the newly activated tab
    try {
        await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(
                activeInfo.tabId,
                { action: "resumeVideos" },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    console.log("Videos resumed in tab:", activeInfo.tabId);
                    resolve(response);
                }
            );
        });
    } catch (error) {
        console.error("Failed to resume videos:", error);
    }

    previousTabId = activeInfo.tabId;
});