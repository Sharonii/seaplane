// Maximum time from appearance of stimulus until reaction. If not showing any
// stimulus, then waiting for this long will count as success.
DEADLINE = 2000;

// Base delay for all words. This is added to the word-specific delay in WORDS.
BASE_DELAY = 500;

// Amount of time to show the focus crosshair before showing the word.
CROSSHAIR_DELAY = 1000;

// Delay between stages (after hitting space or hitting the deadline)
STAGE_DELAY = 2000;

// Number of catch trials (trials with no stimulus)
CATCH_TRIALS = 24;

WORDS = {
    up: [
        ["ציפור", 250],
        ["מטוס", 250],
        ["עננים", 250],
		["שמש", 250],
		["כוכבים", 250],
		["תקרה", 250],
		["גג", 250],
		["שמיים", 250],
		["כובע", 250],
		["פסגה", 250],
		["ירח", 250],
		["ברק", 250],
		["מגדל", 250],
		["נשר", 250],
		["ראש", 250],
		["צמרת", 250],
		["הר", 250],
		["מסוק", 250],
		["עפיפון", 250],
		["קשת", 250],
    ],
    down: [
        ["דשא", 250],
        ["אדמה", 250],
        ["רצפה", 250],
		["שטיח", 250],
		["שביל", 250],
		["נעליים", 250],
		["בור", 250],
		["נחש", 250],
		["גמד", 250],
		["שלולית", 250],
		["מחצלת", 250],
		["חול", 250],
		["שורשים", 250],
		["נמלים", 250],
		["מדרכה", 250],
		["תהום", 250],
		["תחתית", 250],
		["מרתף", 250],
		["מדרגה", 250],
		["רגל", 250],
    ],
    neutral: [
        ["בית", 250],
        ["שולחן", 250],
        ["ספר", 250],
		["עץ", 250],
		["מים", 250],
		["נוף", 250],
		["עפרון", 250],
		["קיר", 250],
		["דלת", 250],
		["חבר", 250],
		["חלון", 250],
		["רוח", 250],
		["חדר", 250],
		["מכונית", 250],
		["שקית", 250],
		["וילון", 250],
		["מחשב", 250],
		["טבע", 250],
		["עיר", 250],
		["חולצה", 250]
    ],
}
