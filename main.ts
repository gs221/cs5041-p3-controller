let stage = ""
let role = ""
let register = false
let PLAYER_ID = 0;
let PLAYER_ID_STR = "";
let current_player_index = 0
let current_player_index2 = 0
let voted = ""
let voted2 = ""
let player_list: string[] = []
let messageParts: string[] = []
let roleInfo: string[] = []

const name = control.deviceName().trim();

basic.showLeds(`
    . . . . .
    . # . # .
    # . . . #
    . # . # .
    . . . . .
    `)

radio.setGroup(1)

function kill () {
    voted = player_list[current_player_index]
    basic.showString("" + (voted))

    input.onPinReleased(TouchPin.P2, function () {
        if (current_player_index < player_list.length - 1) {
            current_player_index += 1
            voted = player_list[current_player_index]
            basic.showString(voted)
        } else {
            current_player_index = 0;
            voted = player_list[current_player_index]
            basic.showString(voted)
        }
    })
    
    input.onPinReleased(TouchPin.P0, function() {
        radio.sendString("vote:" + voted)
        basic.showIcon(IconNames.Yes);
        basic.clearScreen();
    })
}

function vote () {
    voted = player_list[current_player_index2]
    basic.showString("" + (voted))

    input.onPinReleased(TouchPin.P2, function () {
        if (current_player_index2 < player_list.length - 1) {
            current_player_index2 += 1
            voted = player_list[current_player_index2]
            basic.showString(voted)
        } else {
            current_player_index2 = 0;
            voted = player_list[current_player_index2]
            basic.showString(voted)
        }

    })

    input.onPinReleased(TouchPin.P0, function () {
        radio.sendString("vote:" + voted)
        basic.showIcon(IconNames.Yes);
        basic.clearScreen();
    })
}

input.onButtonPressed(Button.AB, function () {
    if (register == false) {
        serial.writeLine(name);
        radio.sendString("register:" + name)
        basic.showIcon(IconNames.Yes);
        basic.clearScreen()
    } else {
        showRole();
    }
})

function showRole () {
    if (role == "h") {
        basic.showIcon(IconNames.TShirt)
        basic.clearScreen();
    } else if (role == "w") {
        basic.showIcon(IconNames.Angry)
        basic.clearScreen();
    } else {
        serial.writeLine("[ERROR] Invalid role.")
    }
}


radio.onReceivedString(function (receivedString) {
    messageParts = receivedString.split(":")

    if (messageParts[0].trim() == name) {
        PLAYER_ID = parseInt(messageParts[1]);
        PLAYER_ID_STR = PLAYER_ID + "";
        register = true;
    }

    else if (messageParts[0].trim() == "ro") {
        serial.writeLine(messageParts[1]);
        let roles = messageParts[1].trim().split("");
        role = roles[PLAYER_ID - 1];
        showRole()
    }

    else if (messageParts[0] == "stage") {
        stage = messageParts[1].trim();
        if (stage == "day") {
            vote()
        } else if (stage == "night" && role == "w") {
            kill()
        } else {
            serial.writeLine("[ERROR] Invalid stage.")
        }
    }
    
    else if (messageParts[0] == "dead") {
        if (PLAYER_ID_STR == messageParts[1].trim()) {
            basic.showIcon(IconNames.Ghost);
            music.playTone(Note.C, music.beat(BeatFraction.Double))
            while (true);
        } else {
            player_list = player_list.filter((p) => p != messageParts[1].trim());
        }
    }

    if (messageParts[0] == "pl") {
        player_list = messageParts[1].split("")
    }
})

