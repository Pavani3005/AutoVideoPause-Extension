let playingVideos = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in content script:", message);
    
    if (message.action === "pauseVideos") {
        const videos = document.getElementsByTagName('video');
        console.log("Found videos:", videos.length);
        
        for (let video of videos) {
            if (!video.paused) {
                // Store both the playing state and current time
                playingVideos.set(video, {
                    wasPlaying: true,
                    timestamp: video.currentTime
                });
                video.pause();
                console.log("Paused video at:", video.currentTime);
            }
        }
        sendResponse({ success: true, videosFound: videos.length });
    }
    
    if (message.action === "resumeVideos") {
        for (let [video, state] of playingVideos.entries()) {
            if (state.wasPlaying) {
                video.currentTime = state.timestamp;
                video.play();
                console.log("Resumed video from:", state.timestamp);
            }
        }
        // Clear the map after resuming
        playingVideos.clear();
        sendResponse({ success: true });
    }
    
    return true;
});