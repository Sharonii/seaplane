QUnit.test("Shuffle test", function(assert) {
    var original_arr = [1,2,3,4,5,6,7];
    var shuffled_arr = shuffled(original_arr);
    assert.deepEqual(original_arr, [1,2,3,4,5,6,7],
	             "shuffled() should not modify its parameter");
    assert.equal(shuffled_arr.length, original_arr.length,
	         "shuffled() should not modify length");
});

QUnit.test("TSV output", function(assert) {
    var result = {
	word: "עברית",
	word_english: "english",
	word_group: 2,
	stimulus_shown: 1,
	reaction_time: 42,
	subject_behavior_correct: 1,
    }
    assert.equal(resultToTsv(result, 123, 50),
	         "123\t51\tenglish\t2\t1\t42\t1\r\n");
});

QUnit.test("Stage generation", function(assert) {
    var word_lists_and_categories = [
        [
	    [
		["hebrew1", 251, "english1"],
		["hebrew2", 252, "english2"],
	    ], 1
	],
        [
	    [
		["hebrew3", 253, "english3"],
		["hebrew4", 254, "english4"],
	    ], 2
	],
        [
	    [
		["hebrew5", 255, "english5"],
		["hebrew6", 256, "english6"],
	    ], 0
	],
    ];
    assert.deepEqual(regularStagesInOrder(word_lists_and_categories),
	    [
	      {
		category: 1,
		duration: 251,
		stimulus: 1,
		word: "hebrew1",
		word_english: "english1"
	      },
	      {
		category: 1,
		duration: 251,
		stimulus: 1,
		word: "hebrew1",
		word_english: "english1"
	      },
	      {
		category: 1,
		duration: 251,
		stimulus: 2,
		word: "hebrew1",
		word_english: "english1"
	      },
	      {
		category: 1,
		duration: 251,
		stimulus: 2,
		word: "hebrew1",
		word_english: "english1"
	      },
	      {
		category: 1,
		duration: 252,
		stimulus: 1,
		word: "hebrew2",
		word_english: "english2"
	      },
	      {
		category: 1,
		duration: 252,
		stimulus: 1,
		word: "hebrew2",
		word_english: "english2"
	      },
	      {
		category: 1,
		duration: 252,
		stimulus: 2,
		word: "hebrew2",
		word_english: "english2"
	      },
	      {
		category: 1,
		duration: 252,
		stimulus: 2,
		word: "hebrew2",
		word_english: "english2"
	      },
	      {
		category: 2,
		duration: 253,
		stimulus: 1,
		word: "hebrew3",
		word_english: "english3"
	      },
	      {
		category: 2,
		duration: 253,
		stimulus: 1,
		word: "hebrew3",
		word_english: "english3"
	      },
	      {
		category: 2,
		duration: 253,
		stimulus: 2,
		word: "hebrew3",
		word_english: "english3"
	      },
	      {
		category: 2,
		duration: 253,
		stimulus: 2,
		word: "hebrew3",
		word_english: "english3"
	      },
	      {
		category: 2,
		duration: 254,
		stimulus: 1,
		word: "hebrew4",
		word_english: "english4"
	      },
	      {
		category: 2,
		duration: 254,
		stimulus: 1,
		word: "hebrew4",
		word_english: "english4"
	      },
	      {
		category: 2,
		duration: 254,
		stimulus: 2,
		word: "hebrew4",
		word_english: "english4"
	      },
	      {
		category: 2,
		duration: 254,
		stimulus: 2,
		word: "hebrew4",
		word_english: "english4"
	      },
	      {
		category: 0,
		duration: 255,
		stimulus: 1,
		word: "hebrew5",
		word_english: "english5"
	      },
	      {
		category: 0,
		duration: 255,
		stimulus: 1,
		word: "hebrew5",
		word_english: "english5"
	      },
	      {
		category: 0,
		duration: 255,
		stimulus: 2,
		word: "hebrew5",
		word_english: "english5"
	      },
	      {
		category: 0,
		duration: 255,
		stimulus: 2,
		word: "hebrew5",
		word_english: "english5"
	      },
	      {
		category: 0,
		duration: 256,
		stimulus: 1,
		word: "hebrew6",
		word_english: "english6"
	      },
	      {
		category: 0,
		duration: 256,
		stimulus: 1,
		word: "hebrew6",
		word_english: "english6"
	      },
	      {
		category: 0,
		duration: 256,
		stimulus: 2,
		word: "hebrew6",
		word_english: "english6"
	      },
	      {
		category: 0,
		duration: 256,
		stimulus: 2,
		word: "hebrew6",
		word_english: "english6"
	      }
	    ]);
});

QUnit.test("Stage generation", function(assert) {
    seaplane.practiceMode = false;
    var experiment = planExperiment();
    var stimuli_histogram = { 0: 0, 1: 0, 2: 0 };
    var total_words = WORDS.up.length + WORDS.down.length +
                      WORDS.neutral.length;
    for (var i = 0; i < experiment.length; i++) {
	stimuli_histogram[experiment[i].stimulus] += 1;
    }
    var expected_histogram = {
	0: CATCH_TRIALS,
	1: total_words * 2,
	2: total_words * 2,
    }
    assert.deepEqual(stimuli_histogram, expected_histogram);
});

QUnit.test("Practice stage generation", function(assert) {
    seaplane.practiceMode = true;
    var experiment = planExperiment();
    var stimuli_histogram = { 0: 0, 1: 0, 2: 0 };
    var total_words = WORDS.up.length + WORDS.down.length +
                      WORDS.neutral.length;
    for (var i = 0; i < experiment.length; i++) {
	stimuli_histogram[experiment[i].stimulus] += 1;
    }
    
    console.info("Practice experiment:", experiment);
    assert.equal(experiment.length, WORDS.practice.length);
    assert.equal(stimuli_histogram[0], CATCH_TRIALS_PRACTICE,
                 "Number of catch trials should be " + CATCH_TRIALS_PRACTICE);
    assert.ok(stimuli_histogram[1] >= 2, "At least 2 up stimuli - got " +
	                                 stimuli_histogram[1]);
    assert.ok(stimuli_histogram[2] >= 2, "At least 2 down stimuli - got " +
	                                 stimuli_histogram[2]);
});
