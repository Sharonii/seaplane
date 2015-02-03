// Maximum time from appearance of stimulus until reaction. If not showing any
// stimulus, then waiting for this long will count as success.
DEADLINE = 2000;

// Base delay for all words. This is added to the word-specific delay in WORDS.
BASE_DELAY = 500;

// Amount of time to show the focus crosshair before showing the word.
CROSSHAIR_DELAY = 1000;

// Delay between stages (after hitting space or hitting the deadline)
STAGE_DELAY = 2000;

WORDS = {
    up: [
        ["ציפור", 500],
        ["מטוס", 400],
        ["ענן", 300],
    ],
    down: [
        ["מגפיים", 600],
        ["אדמה", 400],
        ["שורשי", 500],
    ],
    neutral: [
        ["אף", 200],
        ["מרכז", 400],
        ["רכבות", 500],
    ],
}