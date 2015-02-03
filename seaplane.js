/*
 * seaplane.js - Ohad Lutzky <lutzky@gmail.com> 2015-01-22
 *
 * Implementation of seaplane experiment as designed by Sharon Novikov.
 */

var flipme = false;
var userShouldPressSpace = false;
var startTime = performance.now();
var spaceWasPressed = false;
var spaceEnabled = false;

function $(selector) {
    // Poor man's implementation, no jquery necessary.
    return document.getElementById(selector.slice(1));
}

timeout_handles = {
    absolute: null,
    space: null,
}

var STIMULUS_UP = 1;
var STIMULUS_DOWN = 2;
var STIMULUS_NONE = 3;

Result = function() { // TODO(lutzky) is this how you define classes?
    return {
        subject_id: 42, // TODO(lutzky)
        word: null,
        word_group: null,
        stimulus_shown: null,
        subject_behavior_correct: null,
        reaction_time: null,
    };
}

var currentResult = new Result();

function outputResult() {
    // TODO(lutzky)
    console.info(currentResult);
}

window.onkeypress = function(kbdEvent) {
    if (kbdEvent.keyCode == 32) {
        onSpace(kbdEvent);
    }
}

function unsetTimeout(name) {
    if (timeout_handles[name] != null) {
        window.clearTimeout(timeout_handles[name]);
        timeout_handles[name] = null;
    }
}

function setAbsoluteTimeout(stimulus) {
    timeout_handles.absolute = window.setTimeout(function() {
        spaceEnabled = false;
        currentResult.reaction_time = DEADLINE;
        unsetTimeout("space");
        if (spaceWasPressed) {
            console.error("Got to absoluteTimeout function with spaceWasPressed = true");
        }
        if (userShouldPressSpace) {
            showResult("TOO SLOW", false);
        }
        else {
            showResult("NICE PATIENCE", true);
        }
        outputResult();
        nextStage();
    }, DEADLINE);
}

function showResult(text, isGood) {
    $("#center").className = isGood ? "good" : "bad";
    $("#center").innerText = text;
}

function setWaitForSpaceTimeout(t, stimulus) {
    spaceWasPressed = false;
    timeout_handles.space = window.setTimeout(function() {
        console.debug("Stimulus is " + stimulus);
        clearCenter();
        if (stimulus == STIMULUS_UP) {
            setDisplay("top", true);
            userShouldPressSpace = true;
        }
        else if (stimulus == STIMULUS_DOWN) {
            setDisplay("bottom", true);
            userShouldPressSpace = true;
        }
        else {
            userShouldPressSpace = false;
        }
        startTime = performance.now();
        setAbsoluteTimeout(stimulus);
    }, t); 
}

function setDisplay(id, visible) {
    console.debug("Setting visibility of " + id + " to " + visible);
    elem = document.getElementById(id);
    if (visible) {
        elem.style.display = "initial"; // TODO(lutzky): Is this appropriate?
    }
    else {
        elem.style.display = "none";
    }
}

function tooSoon() {
    showResult("TOO SOON", false);
}

function onSpace(kbdEvent) {
    if (!spaceEnabled) {
        console.debug("Space hit while disabled");
        return;
    }
    spaceEnabled = false;

    currentResult.reaction_time = Math.floor(performance.now() - startTime);
    spaceWasPressed = true;
    unsetTimeout("space");
    unsetTimeout("absolute");

    if (!userShouldPressSpace) {
        tooSoon();
    }
    else {
        showResult(currentResult.reaction_time + "ms", true);
    }

    outputResult();
    nextStage();
}

function planExperiment() {  // TODO(lutzky) this should actually be used
    var in_order = [];
    // get the entire experiment in one ordered array
    // ...then shuffle it (grab one random stage at a time)  // TODO bad comment
    word_lists = [WORDS.up, WORDS.down, WORDS.neutral];
    for (var wl = 0; wl < 3; ++wl) {
        var words = word_lists[wl];
        for (var i = 0; i < words.length; i++) {
            for (var j = 0; j < INSTANCES_PER_STIMULUS; j++) {
                in_order.push([words[i], STIMULUS_UP]);
                in_order.push([words[i], STIMULUS_DOWN]);
            }
        }
    }

    // TODO(lutzky): Insert no-stimulus instances (How to choose?)

    var num_stages = in_order.length;

    var shuffled = [];
    for (var i = 0; i < length; i++) {
        shuffled.push(in_order[i]);
        // TODO(lutzky): How to remove? Does JS have sets?
    }
}

function selectIt() {
    var wordlist;

    // TODO(lutzky): What should actually happen is pre-planning of the
    // experiment - a function that outputs a series of [word, category,
    // stimulus] for the entire experiment, in the appropriate length.
    // This should include the various considerations of matched and mismatched
    // stimuli, as well as the appropriate number of no-stimulus stages.
    // Advantages:
    // 1. Easily testable
    // 2. Easy to declare "experiment is over, next please"
    var selection = Math.ceil(Math.random() * 3);
    var stimulus = Math.ceil(Math.random() * 3);
    if (selection == STIMULUS_UP) {
        wordlist = WORDS.up;
    }
    else if (selection == STIMULUS_DOWN) {
        wordlist = WORDS.down;
    }
    else {
        wordlist = WORDS.neutral;
    }

    currentResult.word_group = selection;

    console.debug("Selected wordgroup is " + selection);
    var selected_word = wordlist[Math.floor(Math.random() * wordlist.length)];

    waitForIt(selected_word[0], selected_word[1], stimulus);
}

function nextStage() {
    window.setTimeout(function() {
        $("#center").className = "";
        selectIt();
    }, STAGE_DELAY);
}

function showCross() {
    $("#center").innerText = "+";
}

function clearCenter() {
    $("#center").innerText = "";
}

function waitForIt(word, delay, stimulus) {
    spaceEnabled = false;
    setDisplay("top", false);
    setDisplay("bottom", false);
    currentResult.word = word;
    currentResult.stimulus_shown = stimulus;

    console.info("Showing word " + word + " with delay " + delay +
                 "ms with stimulus " + stimulus);
    userShouldPressSpace = false;
    showCross();
    setTimeout(function() {
        $("#center").innerText = word;
        spaceEnabled = true;
        setWaitForSpaceTimeout(BASE_DELAY + delay, stimulus);
    }, CROSSHAIR_DELAY);   
}


selectIt();
