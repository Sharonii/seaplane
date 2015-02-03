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

function regularStagesInOrder(word_lists_and_categories) {
    var result = [];

    for (var i = 0; i < word_lists_and_categories.length; i++) {
        words = word_lists_and_categories[i][0];
        category = word_lists_and_categories[i][1];
        for (var j = 0; j < words.length; j++) {
            up_stage = {
                word: words[j][0],
                duration: words[j][1],
                category: category,
                stimulus: STIMULUS_UP,
            };
            down_stage = Object.create(up_stage);
            down_stage.stimulus = STIMULUS_DOWN;

            result.push(up_stage);
            result.push(up_stage);
            result.push(down_stage);
            result.push(down_stage);
        }
    }

    return result;
}

/*
 * Add n catch-trials to the end of stages by duplicating n random stages to
 * the end, with the stimulus set to NONE.
 */
function addCatchTrials(stages, n) {
    original_length = stages.length;

    for (var i = 0; i < n; i++) {
        random_stage = stages[Math.floor(Math.random() * original_length)];
        random_stage = Object.create(random_stage);
        random_stage.stimulus = STIMULUS_NONE;
        stages.push(random_stage);
    }
}

function shuffled(arr) {
    var original = arr.slice(0);
    var result = []

    while (original.length > 0) {
        var random_index = Math.floor(Math.random() * original.length);
        result.push(original.splice(random_index, 1)[0]);
    }

    return result;
}

function planExperiment() {
    var stages = regularStagesInOrder([
            [WORDS.up, STIMULUS_UP],
            [WORDS.down, STIMULUS_DOWN],
            [WORDS.neutral, STIMULUS_NONE],
    ]);

    addCatchTrials(stages, CATCH_TRIALS);

    return shuffled(stages);
}

function nextStage() {
    window.setTimeout(function() {
        $("#center").className = "";
        CURRENT_STAGE++;
        // TODO(lutzky): What if we're out of stages?
        waitForIt();
    }, STAGE_DELAY);
}

function showCross() {
    $("#center").innerText = "+";
}

function clearCenter() {
    $("#center").innerText = "";
}

function waitForIt() {
    var stage = STAGES[CURRENT_STAGE];
    spaceEnabled = false;
    setDisplay("top", false);
    setDisplay("bottom", false);
    currentResult.word = stage.word;
    currentResult.stimulus_shown = stage.stimulus;

    console.info("Stage " + CURRENT_STAGE);
    console.info(stage);
    userShouldPressSpace = false;
    showCross();
    setTimeout(function() {
        $("#center").innerText = stage.word;
        spaceEnabled = true;
        setWaitForSpaceTimeout(BASE_DELAY + stage.duration, stage.stimulus);
    }, CROSSHAIR_DELAY);
}


var STAGES = planExperiment();
var CURRENT_STAGE = 0;
waitForIt();
