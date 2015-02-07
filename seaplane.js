/*
 * seaplane.js - Ohad Lutzky <lutzky@gmail.com> 2015-01-22
 *
 * Implementation of seaplane experiment as designed by Sharon Novikov.
 */

var seaplane = {
    userShouldPressSpace: false,
    startTime: null,
    spaceWasPressed: false,
    spaceEnabled: false,
    stages: [],
    currentStage: 0,
    subjectId: 0,
    tsvResults: [],
    currentResult: null,
}

function $(selector) {
    // Poor man's implementation, no jquery necessary.
    return document.getElementById(selector.slice(1));
}

timeout_handles = {
    absolute: null,
    space: null,
    isi: null,
}

var STIMULUS_UP = 1;
var STIMULUS_DOWN = 2;
var STIMULUS_NONE = 0;

Result = function() {
    this.word = null;
    this.word_group = null;
    this.word_english = null;
    this.stimulus_shown = null;
    this.subject_behavior_correct = null;
    this.reaction_time = null;
}

function outputResult() {
    var startOutput = performance.now();
    var tsv = "";
    tsv += seaplane.subjectId;
    tsv += "\t" + (seaplane.currentStage + 1);
    values = [
            seaplane.currentResult.word_english,
            seaplane.currentResult.word_group,
            seaplane.currentResult.stimulus_shown,
            seaplane.currentResult.reaction_time,
            seaplane.currentResult.subject_behavior_correct ? 1 : 0,
    ];
    for (var i = 0; i < values.length; i++) {
        if (values[i] === null) {
            console.error("seaplane.currentResult has a null value");
            console.error(seaplane.currentResult);
            throw "seaplane.currentResult has a null value";
        }
        tsv += "\t" + values[i];
    }

    tsv += "\r\n";
    seaplane.tsvResults.push(tsv);

    result_tsv_blob = new Blob(seaplane.tsvResults);
    $('#download').href = URL.createObjectURL(result_tsv_blob);
    elapsed = Math.floor(performance.now() - startOutput);
    console.debug("TSV output took " + elapsed + "ms");
    console.debug("TSV: " + tsv);
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
        seaplane.spaceEnabled = false;
        seaplane.currentResult.reaction_time = DEADLINE;
        unsetTimeout("space");
        unsetTimeout("isi");
        if (seaplane.spaceWasPressed) {
            throw "Got to absoluteTimeout function with spaceWasPressed = true";
        }
        if (seaplane.userShouldPressSpace) {
            seaplane.currentResult.subject_behavior_correct = false;
            showResult("TOO SLOW", false);
        }
        else {
            seaplane.currentResult.subject_behavior_correct = true;
            console.info("Subject was patient and did not jump the gun");
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
    seaplane.spaceWasPressed = false;
    timeout_handles.space = window.setTimeout(function() {
        console.debug("Stimulus is " + stimulus);
        clearCenter();
        timeout_handles.isi = window.setTimeout(function() {
            if (stimulus == STIMULUS_UP) {
                displayStimulus("top", true);
                seaplane.userShouldPressSpace = true;
            }
            else if (stimulus == STIMULUS_DOWN) {
                displayStimulus("bottom", true);
                seaplane.userShouldPressSpace = true;
            }
            else {
                seaplane.userShouldPressSpace = false;
            }
            seaplane.startTime = performance.now();
            setAbsoluteTimeout(stimulus);
        }, ISI_DELAY);
    }, t); 
}

function displayStimulus(id, visible) {
    console.debug("Setting visibility of " + id + " to " + visible);
    var elem = document.getElementById(id);
    var style = window.getComputedStyle(document.body);
    elem.className = visible ? 'active' : 'inactive';
}

function tooSoon() {
    showResult("TOO SOON", false);
}

function onSpace(kbdEvent) {
    if (!seaplane.spaceEnabled) {
        console.debug("Space hit while disabled");
        return;
    }
    seaplane.spaceEnabled = false;

    var elapsed = Math.floor(performance.now() - seaplane.startTime);
    seaplane.currentResult.reaction_time = elapsed;
    seaplane.spaceWasPressed = true;
    unsetTimeout("space");
    unsetTimeout("absolute");
    unsetTimeout("isi");

    if (!seaplane.userShouldPressSpace) {
        seaplane.currentResult.subject_behavior_correct = false;
        tooSoon();
    }
    else {
        seaplane.currentResult.subject_behavior_correct = true;
        console.info("Subject reacted in " +
                     seaplane.currentResult.reaction_time + "ms");
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
                word_english: words[j][2],
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
    seaplane.currentStage++;
    window.setTimeout(function() {
        if (seaplane.currentStage < seaplane.stages.length) {
            $("#center").className = "";
            waitForIt();
        }
        else {
            $("#kthxbye").style.display = "initial";
            $("#download").click()
        }
    }, STAGE_DELAY);
}

function showCross() {
    $("#center").innerHTML = "<span class='crosshair'>+</span>";
}

function clearCenter() {
    $("#center").innerText = "";
}

function waitForIt() {
    var stage = seaplane.stages[seaplane.currentStage];
    seaplane.spaceEnabled = false;
    displayStimulus("top", false);
    displayStimulus("bottom", false);
    seaplane.currentResult = new Result();
    seaplane.currentResult.word = stage.word;
    seaplane.currentResult.word_group = stage.category;
    seaplane.currentResult.word_english = stage.word_english;
    seaplane.currentResult.stimulus_shown = stage.stimulus;

    console.info("Stage " + seaplane.currentStage);
    console.info(stage);
    seaplane.userShouldPressSpace = false;
    showCross();
    setTimeout(function() {
        $("#center").innerText = stage.word;
        seaplane.spaceEnabled = true;
        setWaitForSpaceTimeout(BASE_DELAY + stage.duration, stage.stimulus);
    }, CROSSHAIR_DELAY);
}

/* Start the experiment with a new subject */
function startExperiment() {
    seaplane.subjectId = prompt("Enter subject ID");
    seaplane.stages = planExperiment();
    seaplane.currentStage = 0;
    waitForIt();
}

startExperiment();
