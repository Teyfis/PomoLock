// Timer Web Worker
// Handles precise timing even when the browser tab is in background
// Also tracks remaining seconds to detect timer completion independently

let intervalId = null
let remainingSeconds = 0

self.onmessage = function (event) {
    const { type, seconds } = event.data

    switch (type) {
        case 'start':
            if (intervalId !== null) clearInterval(intervalId)
            if (typeof seconds === 'number') {
                remainingSeconds = seconds
            }
            intervalId = setInterval(function () {
                if (remainingSeconds > 0) {
                    remainingSeconds--
                    self.postMessage({ type: 'tick' })
                    if (remainingSeconds === 0) {
                        // Timer completed! Notify main thread immediately
                        self.postMessage({ type: 'completed' })
                    }
                } else {
                    // Hyperfocus mode (counting up) or unknown state
                    self.postMessage({ type: 'tick' })
                }
            }, 1000)
            break

        case 'update-seconds':
            // Update remaining seconds without stopping the interval
            if (typeof seconds === 'number') {
                remainingSeconds = seconds
            }
            break

        case 'hyperfocus':
            // In hyperfocus mode, we count up (no completion detection)
            remainingSeconds = 0
            break

        case 'stop':
            if (intervalId !== null) {
                clearInterval(intervalId)
                intervalId = null
            }
            remainingSeconds = 0
            break

        default:
            break
    }
}
