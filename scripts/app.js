window.addEventListener("DOMContentLoaded", () => {
    // global variables
    let tilesArr = []
    let pieceToMove
    let enemiesToJump = []
    let enemiesLoc = []
    let playerTurn = "blk"
    
    // themeing variables
    let bgSelector = document.querySelector("body")
    let playableGameTile = "gameTile"
    let noAccessGameTile = "noAccess"
    let redPieceImg = "./img/redPiece.png"
    let redKingPieceImg = "./img/redPieceKinged.png"
    let blkPieceImg = "./img/blkPiece.png"
    let blkKingPieceImg = "./img/blkPieceKinged.png"
    let toMoveStyle = "toMove"

    // setup event listener for theme buttons
    document.querySelector("#regularTheme").addEventListener("click", gameTheme)
    document.querySelector("#synthTheme").addEventListener("click", gameTheme)
    
    // setup play button
    document.getElementById("playButton").addEventListener("click", startButton)

    // TEST
    // setupGameBoard()

    // track amount of pieces on the board
    let red = document.getElementsByClassName("red").length
    console.log(`Number of Red pieces: ${red}`) // DELETE
    let blk = document.getElementsByClassName("blk").length
    console.log(`Number of Blk pieces: ${blk}`) // DELETE

    document.getElementById("player1").innerText = `Black Pieces: ${blk}`
    document.getElementById("player2").innerText = `Red Pieces: ${red}`

    
    // ~ FUNCTIONS ~ //

    function trackScore() {
        red = document.getElementsByClassName("red").length
        console.log(`Number of Red pieces: ${red}`) // DELETE
        blk = document.getElementsByClassName("blk").length
        console.log(`Number of Blk pieces: ${blk}`) // DELETE

        if(red == 0) {
            document.getElementById("winningPlayer").innerText = "Black wins!"
            document.getElementById("gameOver").style.display = "flex"
        } else if(blk == 0) {
            document.getElementById("winningPlayer").innerText = "Red wins!"
            document.getElementById("gameOver").style.display = "flex"
        }
    }
    
    // creates divs to represent the gameboard, sets up div classes as well
    function setupGameBoard() {
        let boardContainer = document.getElementById("container")
        
        for (let i = 0; i < 8; i++) {
            // first row of divs starting with a black square
            for (let j = 0; j < 8; j++) {
                let newDiv = document.createElement("div")
                if (j % 2 == i % 2) {
                    // appendChild div with id for it's position on the board and class gameTile and setup player piece
                    newDiv.id = tilesArr.length
                    newDiv.className = playableGameTile
                    tilesArr.push(newDiv)
                    boardContainer.appendChild(newDiv)
                    setupPieces(newDiv)
                } else {
                    // appendChild div with class noAccess and 
                    newDiv.id = tilesArr.length
                    newDiv.className = noAccessGameTile
                    tilesArr.push(newDiv)
                    boardContainer.appendChild(newDiv)
                }
            }
        }
    }

    function setupPieces(tileDiv) {
        let newImg = document.createElement("img")

        // checks if pieces should have a piece set it to red or black
        // reds on top half, blk on bottom half
        if (tilesArr.length < 24) {
            // red pieces
            newImg.src = redPieceImg
            newImg.className = "red"
        } else if (tilesArr.length > 40) {
            // black pieces
            newImg.src = blkPieceImg
            newImg.className = "blk"
        } else {
            return
        }

        newImg.addEventListener("click", chipFunc)
        tileDiv.appendChild(newImg)
    }

    function chipFunc(target) {
        // clear board of event listeners to stop player from moving to location they can't move to
        divEventRemove()
        if(target.path[0].classList.contains(playerTurn)) {
            // find location on board
            let loc = Number(target.path[1].id)
    
            // possible movements
            let directionalArr = [-7, -9, 9, 7]
            // TEST - might not be needed
            let mvUpRight = loc - 7
            let mvUpLeft = loc - 9
            let mvDownRight = loc + 9
            let mvDownLeft = loc + 7
            // ETST - might not be needed
            let mvDirArr = []
            let dblMvDirArr = []
            let movesAvail = []
    
            // check if piece is kinged
            // TEST - was originally = false, will now get set to the return of function isKinged()
            let pieceKinged = isKinged(loc, target.path[0])
    
            if(pieceKinged == false && target.path[0].classList.contains('red')) {
                mvDirArr = [mvDownRight, mvDownLeft]
                dblMvDirArr = [mvDownRight, mvDownLeft]
                // flip directionalArr
                directionalArr = [directionalArr[2], directionalArr[3], directionalArr[0], directionalArr[1]]
            } else if(pieceKinged == false && target.path[0].classList.contains('blk')) {
                mvDirArr = [mvUpRight, mvUpLeft]
                dblMvDirArr = [mvUpRight, mvUpLeft]
            } else {
                // TEST - this will handle the pieces being kinged
                mvDirArr = [mvUpRight, mvUpLeft, mvDownRight, mvDownLeft]
                dblMvDirArr = [mvUpRight, mvUpLeft, mvDownRight, mvDownLeft]
            }
    
            // find available moves
            for(let i = 0; i < mvDirArr.length; i++) {
                if(tilesArr[mvDirArr[i]] == null) {
                    continue
                } else if(tilesArr[mvDirArr[i]].className == playableGameTile && tilesArr[mvDirArr[i]].firstChild == null) {
                    movesAvail.push(tilesArr[mvDirArr[i]])
                } else if(tilesArr[mvDirArr[i]].className == playableGameTile && tilesArr[mvDirArr[i]].firstChild != null && tilesArr[mvDirArr[i]].firstChild.className != target.path[0].className) {
                    // space is occupied by enemy
                    // double distance to see if spot past enemy is open
                    console.log(tilesArr[mvDirArr[i] + directionalArr[i]]) // DELETE
                    if(tilesArr[mvDirArr[i] + directionalArr[i]] == null) {
                        continue
                    } else if(tilesArr[mvDirArr[i] + directionalArr[i]].className == playableGameTile && tilesArr[mvDirArr[i] + directionalArr[i]].firstChild == null) {
                        movesAvail.push(tilesArr[mvDirArr[i] + directionalArr[i]])
                        // push enemy object and location to an array
                        enemiesToJump.push(tilesArr[mvDirArr[i]].firstChild)
                        enemiesLoc.push(tilesArr[mvDirArr[i] + directionalArr[i]])
                    }
                }
            }
            
            if(movesAvail.length == 0){
                alert("That piece has no moves available.") // DELETE
            } else {
                pieceToMove = target.path[0]
                availableLocations(movesAvail)
            }
    
            console.log(movesAvail) // TEST - printout to see if movesAvail is correct
    
            // iterate through movesAvail and setup event listeners
            for(let i = 0; i < movesAvail.length; i++) {
                movesAvail[i].addEventListener("click", divEventAdd, true)
            }
        }
    }

    function divEventAdd(newTarget) {
        // add logic to handle a player piece moving to this location
        newTarget.path[0].appendChild(pieceToMove)
        for(let i = 0; i < enemiesLoc.length; i++) {
            if(newTarget.path[0] == enemiesLoc[i]) {
                enemiesToJump[i].remove()
                enemiesToJump = []
                enemiesLoc = []
            }
        }

        // change player's turn
        if(playerTurn == "blk") {
            playerTurn = "red"
        } else {
            playerTurn = "blk"
        }
        // check for kings
        isKinged(Number(newTarget.path[0].id), pieceToMove)
        // check for winners
        trackScore()
        // remove event listeners
        divEventRemove()
    }

    function isKinged(loc, piece) {
        if(piece.classList.contains("kinged")) {
            console.log("Blk was already kinged") // DELETE
            return true
        }
        if(piece.className == "blk" && loc < 7) {
            console.log("BLK KINGED") // DELETE
            piece.classList.add("kinged")
            return true
        } else if(piece.className == "red" && loc > 56) {
            console.log("RED KINGED") // DELETE
            piece.classList.add("kinged")
            return true
        }
        return false
    }

    function divEventRemove() {
        for(let i = 0; i < tilesArr.length; i++) {
            tilesArr[i].removeEventListener("click", divEventAdd, true)
            tilesArr[i].classList.remove(toMoveStyle)
        }
    }

    function availableLocations(movesAvail) {
        for(let i = 0; i < movesAvail.length; i++) {
            movesAvail[i].classList.add(toMoveStyle)
        }
    }

    function startButton() {
        // change gameStart style display to none
        document.getElementById("gameStart").style.display = "none"
        setupGameBoard()
    }

    function gameTheme(themeChoice) {
        if (themeChoice.path[0].value == "synth") {
            bgSelector.className = "synthBg"
            playableGameTile = "gameTileSynth"
            noAccessGameTile = "noAccessSynth"
            redPieceImg = "./img/synth_theme/redPiece.png"
            redKingPieceImg = "./img/synth_theme/redPieceKinged.png"
            blkPieceImg = "./img/synth_theme/blkPiece.png"
            blkKingPieceImg = "./img/synth_theme/blkPieceKinged.png"
            toMoveStyle = "toMoveSynth"
        } else {
            bgSelector.className = "regBg"
            playableGameTile = "gameTile"
            noAccessGameTile = "noAccess"
            redPieceImg = "./img/redPiece.png"
            redKingPieceImg = "./img/redPieceKinged.png"
            blkPieceImg = "./img/blkPiece.png"
            blkKingPieceImg = "./img/blkPieceKinged.png"
            toMoveStyle = "toMove"
        }
    }
})

// MVP
// [X] A functional menu for starting the game
// [X] Having win conditions
// [X] Having players "consume" or "jump" enemy pieces
// [X] Limiting player movements so player cannot go out of bounds of the board,
//    or to a space they shouldn't be allowed to occupy (like moving backwards at the beginning)
// [X] Allowing players to be "Kinged" to let their pieces go in reverse direction
// [X] Alternating turns between Player 1 and Player 2