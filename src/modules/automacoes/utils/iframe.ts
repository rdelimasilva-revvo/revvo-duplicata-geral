export const setupIframeResizer = () => {
  let resizeTimeout: number;
  let isResizing = false;

  // Function to calculate and send the height
  const sendHeight = () => {
    if (isResizing) return;
    isResizing = true;

    const height = Math.ceil(Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    ));

    // Only send message if we're in an iframe
    if (window !== window.parent) {
      window.parent.postMessage({ type: 'resize', height }, '*');
    }

    isResizing = false;
  };

  // Create observer after sendHeight is defined
  const observer = new MutationObserver(sendHeight);

  // Debounce function for resize events
  const debouncedSendHeight = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(sendHeight, 100);
  };

  // Initial setup
  // Delay initial height calculation to ensure content is rendered
  setTimeout(sendHeight, 100);
  
  // Setup mutation observer
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  // Add event listeners
  window.addEventListener('resize', debouncedSendHeight);
  window.addEventListener('load', sendHeight);
  window.addEventListener('DOMContentLoaded', sendHeight);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', debouncedSendHeight);
    window.removeEventListener('load', sendHeight);
    window.removeEventListener('DOMContentLoaded', sendHeight);
    clearTimeout(resizeTimeout);
  };
};