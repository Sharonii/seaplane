/*
 * seaplane.js - Ohad Lutzky <lutzky@gmail.com> 2015-01-22
 *
 * Implementation of seaplane experiment as designed by Sharon Novikov.
 */

var seaplane = {
    userShouldPressSpace: false,
    startTime: null,
    spaceWasPressed: false,
    spaceHandler: null,
    practiceMode: false,
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

function resultToTsv(result, subjectId, currentStage) {
    var tsv = "";
    tsv += subjectId;
    tsv += "\t" + (currentStage + 1);
    values = [
            result.word_english,
            result.word_group,
            result.stimulus_shown,
            result.reaction_time,
            result.subject_behavior_correct ? 1 : 0,
    ];
    for (var i = 0; i < values.length; i++) {
        if (values[i] === null) {
            console.error("result", result, "has a null value");
            throw "result has a null value";
        }
        tsv += "\t" + values[i];
    }
    tsv += "\r\n";

    return tsv;
}

function outputResult() {
    var startOutput = performance.now();
    var tsv = resultToTsv(seaplane.currentResult, seaplane.subjectId,
                          seaplane.currentStage);

    console.debug("TSV:", tsv);

    if (seaplane.practiceMode) {
        console.debug("Practice stage - Not updating TSV blob");
    }
    else {
        seaplane.tsvResults.push(tsv);
        result_tsv_blob = new Blob(seaplane.tsvResults);
        $('#download').href = URL.createObjectURL(result_tsv_blob);
        elapsed = Math.floor(performance.now() - startOutput);
        console.debug("TSV blob update took " + elapsed + "ms");
    }
}

window.addEventListener("keypress", function(kbdEvent) {
    if (kbdEvent.keyCode == 32) {
        if (!seaplane.spaceHandler) {
            console.debug("Space hit while disabled");
            return;
        }
        seaplane.spaceHandler()
    }
})

function unsetTimeout(name) {
    if (timeout_handles[name] != null) {
        window.clearTimeout(timeout_handles[name]);
        timeout_handles[name] = null;
    }
}

function setAbsoluteTimeout(stimulus) {
    timeout_handles.absolute = window.setTimeout(function() {
        var isError = false;

        seaplane.spaceHandler = null;
        displayStimulus("top", false);
        displayStimulus("bottom", false);

        seaplane.currentResult.reaction_time = DEADLINE;
        unsetTimeout("space");
        unsetTimeout("isi");
        if (seaplane.spaceWasPressed) {
            throw "Got to absoluteTimeout function with spaceWasPressed = true";
        }
        if (seaplane.userShouldPressSpace) {
            seaplane.currentResult.subject_behavior_correct = false;
            showResult("לאט מדי", false);
            isError = true;
        }
        else {
            seaplane.currentResult.subject_behavior_correct = true;
            console.info("Subject was patient and did not jump the gun");
        }
        outputResult();
        nextStage(isError);
    }, DEADLINE);
}

function showResult(text, isGood) {
    $("#center").className = isGood ? "good" : "bad";
    $("#center").innerText = text;
}

function setWaitForSpaceTimeout(t, stimulus) {
    seaplane.spaceWasPressed = false;
    timeout_handles.space = window.setTimeout(function() {
        console.debug("Stimulus is ", stimulus);
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
    console.debug("Setting visibility of", id, "to", visible);
    var elem = document.getElementById(id);
    var style = window.getComputedStyle(document.body);
    elem.className = visible ? 'active' : 'inactive';
}

function tooSoon() {
    showResult("שגיאה", false);
}

function onResponse(kbdEvent) {
    var isError = false;
    seaplane.spaceHandler = null;
    displayStimulus("top", false);
    displayStimulus("bottom", false);

    var elapsed = Math.floor(performance.now() - seaplane.startTime);
    seaplane.currentResult.reaction_time = elapsed;
    seaplane.spaceWasPressed = true;
    unsetTimeout("space");
    unsetTimeout("absolute");
    unsetTimeout("isi");

    if (!seaplane.userShouldPressSpace) {
        seaplane.currentResult.subject_behavior_correct = false;
        tooSoon();
        isError = true;
    }
    else {
        seaplane.currentResult.subject_behavior_correct = true;
        console.info("Subject reacted in " +
                     seaplane.currentResult.reaction_time + "ms");
    }

    outputResult();
    nextStage(isError);
}

function regularStagesInOrder(word_lists_and_categories) {
    var result = [];

    for (var i = 0; i < word_lists_and_categories.length; i++) {
        words = word_lists_and_categories[i][0];
        category = word_lists_and_categories[i][1];
        var stimuli = [];

        if (seaplane.practiceMode) {
            for (i = 0; i < words.length / 2; i++) {
                stimuli.push(STIMULUS_UP);
                stimuli.push(STIMULUS_DOWN);
            }
            stimuli = shuffled(stimuli);
        }

        for (var j = 0; j < words.length; j++) {
            up_stage = {
                word: words[j][0],
                duration: words[j][1],
                word_english: words[j][2],
                category: category,
                stimulus: STIMULUS_UP,
            };

            if (seaplane.practiceMode) {
                up_stage.stimulus = stimuli[j];
                result.push(up_stage);
            }
            else {
                down_stage = Object.create(up_stage);
                down_stage.stimulus = STIMULUS_DOWN;
                result.push(up_stage);
                result.push(up_stage);
                result.push(down_stage);
                result.push(down_stage);
            }
        }
    }

    return result;
}

/*
 * Add n catch-trials to the end of stages by duplicating n random stages to
 * the end, with the stimulus set to NONE.
 * In practice mode, the originals will be replaced with catch-trials.
 */
function addCatchTrials(stages, n) {
    original_length = stages.length;

    var already_selected = {}
    for (var i = 0; i < n; i++) {
        do {
            random_index = Math.floor(Math.random() * original_length);
        } while(random_index in already_selected);

        already_selected[random_index] = true;

        random_stage = stages[random_index];
        if (seaplane.practiceMode) {
            random_stage.stimulus = STIMULUS_NONE;
        }
        else {
            random_stage_copy = Object.create(random_stage);
            random_stage_copy.stimulus = STIMULUS_NONE;
            stages.push(random_stage_copy);
        }
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
    var stage_config;
    var stages;

    if (seaplane.practiceMode) {
        stage_config = [[WORDS.practice, STIMULUS_NONE]];
    }
    else {
        stage_config = [
                [WORDS.up, STIMULUS_UP],
                [WORDS.down, STIMULUS_DOWN],
                [WORDS.neutral, STIMULUS_NONE],
        ];
    }

    stages = regularStagesInOrder(stage_config);

    addCatchTrials(stages, seaplane.practiceMode ? CATCH_TRIALS_PRACTICE : CATCH_TRIALS);

    return shuffled(stages);
}

function nextStage(isError) {
    seaplane.currentStage++;
    window.setTimeout(function() {
        if (seaplane.currentStage < seaplane.stages.length) {
            $("#center").className = "";
            waitForIt();
        }
        else {
            if (seaplane.practiceMode) {
                startExperiment(false);  // Real experiment
            }
            else {
                finishExperiment();
            }

        }
    }, isError ? STAGE_DELAY_ON_ERROR : STAGE_DELAY);
}

function showCross() {
    $("#center").innerHTML = "<span class='crosshair'>+</span>";
}

function clearCenter() {
    $("#center").innerText = "";
}

function waitForIt() {
    var stage = seaplane.stages[seaplane.currentStage];
    seaplane.spaceHandler = null;
    displayStimulus("top", false);
    displayStimulus("bottom", false);
    seaplane.currentResult = new Result();
    seaplane.currentResult.word = stage.word;
    seaplane.currentResult.word_group = stage.category;
    seaplane.currentResult.word_english = stage.word_english;
    seaplane.currentResult.stimulus_shown = stage.stimulus;

    console.info("Stage", seaplane.currentStage, stage);
    seaplane.userShouldPressSpace = false;
    showCross();
    setTimeout(function() {
        $("#center").innerText = stage.word;
        seaplane.spaceHandler = onResponse;
        setWaitForSpaceTimeout(BASE_DELAY + stage.duration, stage.stimulus);
    }, CROSSHAIR_DELAY);
}

function finishExperiment() {
    showMessage("kthxbye", true);
    $("#download").click()
}

function startExperiment(isPractice) {
    message_name = isPractice ? "practice_stage" : "experiment_stage";
    showMessage(message_name, true);
    seaplane.spaceHandler = function() {
        showMessage(message_name, false);
        seaplane.spaceHandler = null;
        seaplane.practiceMode = isPractice;
        seaplane.stages = planExperiment();
        seaplane.currentStage = 0;
        waitForIt();
    }
}

function showMessage(message_name, visible) {
    $("#" + message_name).style.display = visible ? "initial" : "none";
}

function introduction() {
    seaplane.subjectId = prompt("Enter subject ID");
    showMessage("ohai", true);
    seaplane.spaceHandler = function() {
        showMessage("ohai", false);
        startExperiment(true);  // Practice
    };
}
