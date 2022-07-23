import { LightningElement } from 'lwc';
// Resource-Image
import congratsImg from '@salesforce/resourceUrl/congrats_img'; 
import AstroImg from '@salesforce/resourceUrl/Astro_img';
import Xicon from '@salesforce/resourceUrl/X_icon';  
import Oicon from '@salesforce/resourceUrl/O_icon';
// Resource-Track
import turnChangeTrack from '@salesforce/resourceUrl/turn_change_track';
import winnerTrack from '@salesforce/resourceUrl/winner_track';
import restartTrack from '@salesforce/resourceUrl/restart_track'; 

export default class TicTacToe extends LightningElement {
    
    // default turn 
    turn = 'X'
    // show/hide Start Game text
    isGameOn = false
    // game over bool
    isGameOver = false
    // turn winning combination & line angle 
    winCombination = [[0, 1, 2, 3, 5, 0],
                        [3, 4, 5, 3, 14, 0],                       
                        [6, 7, 8, 3, 23, 0],
                        [0, 3, 6, -6, 14, 90],
                        [1, 4, 7, 3.3, 14, 90],
                        [2, 5, 8, 12.6, 14, 90],
                        [0, 4, 8, 3.6, 14, 45],
                        [2, 4, 6, 3.6, 14, -45]]
    // options
    options = [{ label: 'Friend', value: 'Friend' },
                { label: 'Computer', value: 'Computer' }]
    playAgainst = 'Computer';
    // play with computer
    computerturn = false
    turnedbox = []
    unturnedbox = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    // img
    congrats_img = congratsImg
    Astro_img = AstroImg
    X_icon = Xicon
    O_icon = Oicon
    //track
    turn_change_track = turnChangeTrack;
    winner_track = winnerTrack;
    restart_track = restartTrack;
    muted = false
    // spinner
    isLoading = false
    // points
    X_Points = 0
    O_Points = 0

    // change to next turn value
    swapTurn(){
        this.turn = this.turn === "X" ? "O" : "X";
    }

    // add border bottom color for X-turn
    get displayBottomColorForXTurn(){
        return this.turn === "X" ? "borderBottomColor pointsTable" : "pointsTable";
    }
    // add border bottom color for O-turn
    get displayBottomColorForOTurn(){
        return this.turn === "O" ? "borderBottomColor pointsTable" : "pointsTable";
    }

    // Shuffle Mute and unMute
    handleMute(){
        this.muted = !this.muted;
    }

    // Play Against Combox handleChange
    handleChangePlayAgainst(event){
        this.playAgainst = event.detail.value;
        this.computerturn = this.playAgainst == 'Computer' ? true : false;
        this.X_Points = this.O_Points = 0;
        this.muted = true;
        this.handleRestart();
        this.muted = false;
    }

    // handleClick on turn change
    handleBoxClick(event){
        this.isGameOn = true;
        // Current box id
        let boxId = event.currentTarget.getAttribute("data-Id");
        let boxindex =  parseInt(boxId.split('-')[1]);
        // 
        this.computerturn = true;
        // Below action only for empty box and GameOver is false
        if(!this.template.querySelector('[data-id=box-'+boxindex+']').textContent
            && !this.isGameOver){
                this.displayTurnVal(boxindex);
        }
    }

    displayTurnVal(boxindex){
        // play sound on each turn 
        this.playTrack(this.turn_change_track);
        // Display Turn Value inside box
        // let displayTurnImg = this.turn === 'X' ? this.X_icon : this.O_icon;
        // text in a span
        this.template.querySelector('[data-id=box-'+boxindex+']').textContent = this.turn;
        // image in a span
        // this.template.querySelector('[data-id='+boxId+']').innerHTML = "<img src="+displayTurnImg+" class="+this.turn+">";
        // add CSS to turn color based on X/O
        this.template.querySelector('[data-id=box-'+boxindex+']').classList.add(this.turn+'-turn-color')
        // Check for winning Combination
        this.checkWinner();
        // Change turn value 
        this.swapTurn();
        // Avoid adding CSS for Next turn without onclick
        this.template.querySelector('[data-id=box-'+boxindex+']').classList.remove(this.turn+'-turn-color')
        // to avoid showing Next trun after Game Over
        if(!this.isGameOver){
            // checkDrawMatch
            this.checkDrawMatch();
            this.template.querySelector('[data-id=player-turn-text]').textContent = this.turn+' turn';
            // this.template.querySelector('[data-id=won-img]').classList.add('addWidth')
            // Computer turn
            if(this.playAgainst == 'Computer'
                && this.computerturn){
                    this.computerturn = false;
                    this.turnedbox.push(boxindex);
                    // remove manually selected box index
                    this.getEmptyBoxIndex(boxindex);
                    console.log('turnedbox: ', this.turnedbox); 
                    boxindex = this.getRandomIndex(this.unturnedbox);
                    console.log('boxindex: ', boxindex); 
                    // remove manually selected box index
                    this.getEmptyBoxIndex(boxindex);
                    console.log('unturnedbox: ', this.unturnedbox); 
                    // Call method to select Next turn 
                    this.displayTurnVal(boxindex);
            }
        }
    }

    // get remaining empty box index values
    getEmptyBoxIndex(boxindex){
        const index = this.unturnedbox.indexOf(boxindex);
        if (index > -1) {
            this.unturnedbox.splice(index, 1); 
        }
    }

    // get a random index from an unturnedbox array
    getRandomIndex(array) {
        const randomboxIndex = Math.floor(Math.random() * array.length);
        const indexval = array[randomboxIndex];
        return indexval;
    }
    
    // Check for winning Combination
    checkWinner(){
        this.winCombination.forEach(e => {
            if(this.template.querySelector('[data-id=box-'+e[0]+']').textContent
                && this.template.querySelector('[data-id=box-'+e[1]+']').textContent
                && this.template.querySelector('[data-id=box-'+e[2]+']').textContent
                && (this.template.querySelector('[data-id=box-'+e[0]+']').textContent == this.template.querySelector('[data-id=box-'+e[1]+']').textContent)
                && (this.template.querySelector('[data-id=box-'+e[1]+']').textContent == this.template.querySelector('[data-id=box-'+e[2]+']').textContent)){
                    // Game Over true
                    this.isGameOver = true;
                    // Remove player-won value text
                    this.template.querySelector('[data-id=player-won]').textContent = this.turn;
                    // Remove Next turn value text
                    this.template.querySelector('[data-id=player-turn-text]').textContent = '';
                    // add pulse CSS to highligh matched turn
                    this.addPulseCssForMatchedPath(e);
                    //Congrats Img
                    this.displayCongratsImg();
                    // add CSS to cross line 
                    this.displayCrossLine(e);
                    // Update players Score
                    this.updatePoints();
                    // play winner sound track
                    this.playTrack(this.winner_track);
                    
            }
        });
    }

    addPulseCssForMatchedPath(e){
        this.template.querySelector('[data-id=box-'+e[0]+']').classList.add('boxPulse');
        this.template.querySelector('[data-id=box-'+e[1]+']').classList.add('boxPulse');
        this.template.querySelector('[data-id=box-'+e[2]+']').classList.add('boxPulse');
    }

    displayCongratsImg(){
        this.template.querySelector('[class=congratsImg]').style.width = `300px`;
    }

    displayCrossLine(e){
        this.template.querySelector('[class=crossline]').style.width = `15rem`;
        this.template.querySelector('[class=crossline]').style.transform = `translate(${e[3]}vw, ${e[4]}vw) rotate(${e[5]}deg)`;
        // this.template.querySelector('[class=line]').classList.add(this.turn+'-turn-line-color');
    }

    updatePoints(){
        this.X_Points = this.turn === 'X' ? this.X_Points + 1 : this.X_Points;
        this.O_Points = this.turn === 'O' ? this.O_Points + 1 : this.O_Points;
    }

    checkDrawMatch(){
        // for (let index = 0; index < 9; index++) {
        //     // check all boxes are filled
        //     if(this.template.querySelector('[data-id=box-'+index+']').textContent){
        //         console.log();
        //     }
        // }
        // if(){

        // }
    }

    // handle Restart on "Restart Game" and "Play Against" 
    handleRestart(){
        this.isLoading = true;
        this.isGameOver = false;
        this.turn = 'X';
        this.turnedbox = [];
        this.unturnedbox = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        // Play restart track
        this.playTrack(this.restart_track);
        // Remove player-won value text
        this.template.querySelector('[data-id=player-won]').textContent = '';
        // Remove Next turn value text
        this.template.querySelector('[data-id=player-turn-text]').textContent = this.turn+' turn';
        // hide congrats img
        this.template.querySelector('[class=congratsImg]').style.width = `0`;
        // hide cross line
        this.template.querySelector('[class=crossline]').style.width = `0`;
        for (let index = 0; index < 9; index++) {
            // Remove X / O value from all boxes
            this.template.querySelector('[data-id=box-'+index+']').textContent = '';
            // Remove Pulse CSS from all boxes
            this.template.querySelector('[data-id=box-'+index+']').classList.remove('boxPulse');
        }
        this.isLoading = false;
    }

    // Play track sound
    playTrack(trackValue){
        this.muted ? '' :  new Audio(trackValue).play();
    }
    
}