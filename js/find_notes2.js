(function () {

    /**
     * Function to generate a song element that details the song name, duration, and notes needed
     * @param {type} song
     * @returns {Element}
     */
    function createSongElement(song) {
        // Create all the elements of a song
        var
                songElement = document.createElement("div"),
                songTitleElement = document.createElement("span"),
                songDurationElement = document.createElement("span"),
                songNotesElement = document.createElement("span"),
                noteElement = null;

        // Add the sub elements to the song element
        songElement.appendChild(songTitleElement);
        songElement.appendChild(songDurationElement);
        songElement.appendChild(songNotesElement);

        // Set the innerHTML of what we know
        songTitleElement.innerHTML = song.songName;
        songDurationElement.innerHTML = song.duration;

        // Set the classes of the elements
        songElement.className = "noteResults";
        songTitleElement.className = "noteResultsTitle";
        songDurationElement.className = "noteResultsDuration";
        songNotesElement.className = "noteResultsNotes";

        // Iterate over each element in the song
        song.notes.forEach(function (note) {
            // Create a note element
            noteElement = document.createElement("span");
            // Add the class name for the color
            noteElement.className = "note" + " " + note.toLowerCase();
            // Add the note to the song
            songNotesElement.appendChild(noteElement);
        });

        // Return the constructed song element
        return songElement;
    }

    /**
     * Find the possible songs that can be played by the given notes
     * @param {Array} givenNotes
     * @param {Array} allSongs
     * @returns {Array}
     */
    function findSongs(givenNotes, allSongs) {

        // Songs that can be played with the notes given
        var possibleSongs = [];
        // Whether the currently analyzed song is viable
        var viableSong = false;

        // Iterate all the available songs
        for (var i = 0; i < allSongs.length; i++) {
            // Consider the song viable until it isn't
            viableSong = true;

            // Keep a shortcut to the current song notes
            var setListSongNotes = allSongs[i].notes;

            // Iterate over all the notes in the song
            for (var j = 0; j < setListSongNotes.length; j++) {
                // If we have not selected that note
                if (givenNotes.indexOf(setListSongNotes[j]) <= -1) {
                    // The song isn't viable
                    viableSong = false;
                    break;
                }
            }

            // If the song is viable
            if (viableSong) {
                // Add it to our list of viable songs
                possibleSongs.push(allSongs[i]);
            }
        }

        // Return the viable songs
        return possibleSongs;
    }

    /**
     * Function to load a set list
     * @param {Function} loadCallback The function to call with the loaded data
     * @returns {undefined}
     */
    function loadSetList(loadCallback) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var setListData = JSON.parse(xhr.responseText);
                loadCallback(setListData);
            }
        });
        xhr.open("GET", "res/json/note_data.json");
        xhr.send();
    }

    /**
     * Class that encapsulates the Hunting Horn Utility
     * @param {type} selectableNotesEl
     * @param {type} availableSongsEl
     * @returns {find_notes_L1.HuntingHornUtil}
     */
    function HuntingHornUtil(selectableNotesEl, availableSongsEl) {
        this.selectableNotesEl = selectableNotesEl;
        this.availableSongsEl = availableSongsEl;

        this.fullSongList = [];
        this.selectedNotes = [];
    }
    HuntingHornUtil.prototype = {
        /**
         * Have the hunting horn utility set up its elements from set list
         * @param {type} setList
         * @returns {undefined}
         */
        initFromSetList: function (setList) {
            this.fullSongList = setList.songs;
            this.generateNoteButtons(setList.availableColors);
        },
        /**
         * Clear the note selection
         * @returns {undefined}
         */
        clearSelection: function () {
            this.selectedNotes.splice(0, this.selectedNotes.length);
        },
        /**
         * Print the available songs that can be played
         * @param {type} availableSongs
         * @returns {undefined}
         */
        printSongs: function (availableSongs) {
            if (availableSongs) {
                this.availableSongsEl.innerHTML = "";
                if (!availableSongs.length) {
                    this.availableSongsEl.innerHTML = "No Available Songs";
                }
                else {
                    availableSongs.forEach(function (viableSong) {
                        var songDiv = createSongElement(viableSong);
                        this.availableSongsEl.appendChild(songDiv);
                    }, this);
                }
            }
            else {
                this.availableSongsEl.innerHTML = "Please select notes";
            }
        },
        /**
         * Create a button, add its properties and add it to the container
         * @param {type} color
         * @returns {undefined}
         */
        instantiateNoteButton: function (color) {
            var
                    hhUtil = this,
                    noteButton = document.createElement("button");

            noteButton.className = ("note" + " " + color.color.replace(/\s/g, "").toLowerCase());
            noteButton.title = (color.color + " " + "Note");
            noteButton.value = (color.color);
            noteButton.dataset.color = (color.color);

            noteButton.addEventListener("click", function (noteClick) {
                if (hhUtil.selectedNotes.indexOf(noteClick.target.dataset.color) <= -1) {
                    hhUtil.selectedNotes.push(noteClick.target.dataset.color);
                }

                var availableSongs = findSongs(hhUtil.selectedNotes, hhUtil.fullSongList);
                hhUtil.printSongs(availableSongs);
            });

            this.selectableNotesEl.appendChild(noteButton);
        },
        /**
         * Function to generate clickable notes
         * @param {type} availableColors
         * @returns {undefined}
         */
        generateNoteButtons: function (availableColors) {
            availableColors.forEach(this.instantiateNoteButton, this);
        }
    };
    HuntingHornUtil.constructor = HuntingHornUtil;

    /**
     * Function to load the app
     * @returns {undefined}
     */
    function bootstrap() {
        var
                availableGamesSelect = null,
                selectableNotesContainer = null,
                availableSongContainer = null,
                clearNotesButton = null,
                hhUtil = null;

        // Get all our elements
        availableGamesSelect = document.getElementById("gameSelect");
        selectableNotesContainer = document.getElementById("selectableNotes");
        availableSongContainer = document.getElementById("availableSongChart");
        clearNotesButton = document.getElementById("clearNotes");

        // Create our util
        hhUtil = new HuntingHornUtil(selectableNotesContainer, availableSongContainer);

        // Go and get our set list file
        loadSetList(function (setList) {
            // Initialize our util with the set list
            hhUtil.initFromSetList(setList);
        });

        // Add ability to clear the notes
        clearNotesButton.addEventListener("click", function () {
            hhUtil.clearSelection();
            hhUtil.printSongs();
        });
    }

    // Wait for our page to load before running our app
    document.addEventListener("DOMContentLoaded", bootstrap);
}());
