// Timer Web Worker
// Handles precise timing even when the browser tab is in background

let intervalId = null

self.onmessage = function (event) {
    const { type } = event.data

    switch (type) {
        case 'start':
            if (intervalId !== null) clearInterval(intervalId)
            intervalId = setInterval(function () {
                self.postMessage({ type: 'tick' })
            }, 1000)
            break

        case 'stop':
            if (intervalId !== null) {
                clearInterval(intervalId)
                intervalId = null
            }
            break

        default:
            break
    }
}
