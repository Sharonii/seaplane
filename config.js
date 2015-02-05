// Maximum time from appearance of stimulus until reaction. If not showing any
// stimulus, then waiting for this long will count as success.
DEADLINE = 2000;

// Base delay for all words. This is added to the word-specific delay in WORDS.
BASE_DELAY = 0;

// Amount of time to show the focus crosshair before showing the word.
CROSSHAIR_DELAY = 1000;

// Delay between stages (after hitting space or hitting the deadline)
STAGE_DELAY = 2000;

// Number of catch trials (trials with no stimulus)
CATCH_TRIALS = 24;

// Inter-stimulus interval - time from word disappearing to stimulus showing
ISI_DELAY = 50;

WORDS = {
    up: [
        ["ציפור", 250, "tzipor"],
        ["מטוס", 250, "matos"],
        ["עננים", 250, "ananim"],
		["שמש", 250, "shemesh"],
		["כוכבים", 250, "kochavim"],
		["תקרה", 250, "tikra"],
		["גג", 250, "gag"],
		["שמיים", 250, "shamayim"],
		["כובע", 250, "kova"],
		["פסגה", 250, "pisga"],
		["ירח", 250, "yareach"],
		["ברק", 250, "barak"],
		["מגדל", 250, "migdal"],
		["נשר", 250, "nesher"],
		["ראש", 250, "rosh"],
		["צמרת", 250, "tzameret"],
		["הר", 250, "har"],
		["מסוק", 250, "masok"],
		["עפיפון", 250, "afifon"],
		["קשת", 250, "keshet"],
    ],
    down: [
        ["דשא", 250, "deshe"],
        ["אדמה", 250, "adama"],
        ["רצפה", 250, "ritzpa"],
		["שטיח", 250, "shatiach"],
		["שביל", 250, "shvil"],
		["נעליים", 250, "naalaim"],
		["בור", 250, "bor"],
		["נחש", 250, "nachash"],
		["גמד", 250, "gamad"],
		["שלולית", 250, "shlulit"],
		["מחצלת", 250, "mechtzelet"],
		["חול", 250, "hol"],
		["שורשים", 250, "shorashim"],
		["נמלים", 250, "nemalim"],
		["מדרכה", 250, "midraha"],
		["תהום", 250, "tehom"],
		["תחתית", 250, "tachtit"],
		["מרתף", 250, "martef"],
		["מדרגה", 250, "madrega"],
		["רגל", 250, "regel"],
    ],
    neutral: [
        ["נייר", 250, "niyar"],
        ["שולחן", 250, "shulchan"],
        ["ספר", 250, "sefer"],
		["לוח", 250, "luach"],
		["מים", 250, "mayim"],
		["נוף", 250, "nof"],
		["עפרון", 250, "iparon"],
		["יער", 250, "yaar"],
		["דלת", 250, "delet"],
		["חבר", 250, "haver"],
		["חלון", 250, "halon"],
		["פרדס", 250, "pardes"],
		["חדר", 250, "heder"],
		["מכונית", 250, "mechonit"],
		["שקית", 250, "sakit"],
		["וילון", 250, "vilon"],
		["מחשב", 250, "mechashev"],
		["טבע", 250, "teva"],
		["עיר", 250, "ir"],
		["חולצה", 250, "hultza"]
    ],
}
