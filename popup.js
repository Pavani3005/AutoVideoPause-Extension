document.addEventListener('DOMContentLoaded', async () => {
    const toggleButton = document.getElementById('toggleButton');
    const statusText = document.getElementById('status');

    // Load saved state
    const { isEnabled = true } = await chrome.storage.local.get('isEnabled');
    toggleButton.checked = isEnabled;
    statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';

    toggleButton.addEventListener('change', async () => {
        const isEnabled = toggleButton.checked;
        await chrome.storage.local.set({ isEnabled });
        statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
    });
});