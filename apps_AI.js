const stone_colors = ["black","white","red","green"];
const DX = [0,1,0,-1,1,1,-1,-1];
const DY = [1,0,-1,0,1,-1,1,-1];
const scoreBoard = [
    [10,-5,0,0,0,0,-5,10],
    [-5,-8,0,0,0,0,-8,-5],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [-5,-8,0,0,0,0,-8,-5],
    [10,-5,0,0,0,0,-5,10]
];
const myTurn = 0;
let iv_id;
class State{
    turn = 0;
    cnt_black = 2;
    cnt_white = 2;
    legal_actions = [];
    state;
    constructor(size){
        this.size = size;
        this.state = new Array(size);
        for(let i=0;i < size;i++){
            this.state[i] = new Array(size);
            for(let j=0;j < size;j++){
                this.state[i][j] = 3;
            }
        }
        this.makeStones();
        this.setInitialStones();
        this.legalActions();
    }

    makeStones(){
        for(let i=0;i < this.size;i++){
            let row = document.createElement("div");
            row.classList.add("board-row");
            row.style.height = `calc(100%/${this.size})`;
            for(let j=0;j < this.size;j++){
                let grid = document.createElement("div");
                let stone = document.createElement("button");
                stone.dataset.x = j;
                stone.dataset.y = i;
                stone.addEventListener('click',() => {
                    this.putStone([j,i]);
                });
                stone.classList.add("board-stone");
                grid.classList.add("board-grid");
                grid.style.width = `calc(100%/${this.size})`;
                grid.appendChild(stone);
                row.appendChild(grid);
            }
            document.querySelector(".board-background").appendChild(row);
        }
    }

    setInitialStones(){
        let mid = this.size/2-1;
        this.state[mid][mid] = 1;
        this.state[mid+1][mid] = 0;
        this.state[mid][mid+1] = 0;
        this.state[mid+1][mid+1] = 1;
    }

    changeColor(x,y,color){
        let target_stone = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        target_stone.classList.remove(`board-stone-${stone_colors[(color+1)%4]}`);
        target_stone.classList.remove(`board-stone-${stone_colors[(color+2)%4]}`);
        target_stone.classList.remove(`board-stone-${stone_colors[(color+3)%4]}`);
        target_stone.classList.add(`board-stone-${stone_colors[color]}`);
    }
    checkFlip(x,y){
        let cnt_flip = 0;
        let flip_stones = [];
        for(let i=0;i < 8;i++){
            let flip_stones_pre = [];
            let nx = x + DX[i],ny = y + DY[i];
            while(nx < this.size && ny < this.size && nx >= 0 && ny >= 0){
                if(this.state[ny][nx] == 3 || this.state[ny][nx] == 2) break;
                if(this.state[ny][nx] == this.turn){
                    if(flip_stones_pre.length > 0)flip_stones.push(...flip_stones_pre);
                    break;
                }
                flip_stones_pre.push([nx,ny]);
                nx += DX[i];
                ny += DY[i];
            }
        }
        return flip_stones;
    }
    changeTurn(){
        (this.turn==0) ? this.turn= 1 : this.turn=0;
    }
    putStone(pos){
        let [x,y] = pos;
        let flip_stones = this.checkFlip(x,y);
        if(flip_stones.length == 0) return;
        flip_stones.push([x,y]);
        for (const [flip_x,flip_y] of flip_stones) {
            this.state[flip_y][flip_x] = this.turn;
        }

        // console.log(this.state);
        this.changeTurn();
        this.legalActions();
        if(this.legal_actions.length == 0){
            this.changeTurn();
            this.legalActions();
        }
    }
    isDone(){
        this.cnt_white = 0,this.cnt_black = 0;
        for(let i=0;i<this.size;i++){
            for(let j=0;j<this.size;j++){
                if(this.state[i][j] == 1) this.cnt_white++;
                if(this.state[i][j] == 0) this.cnt_black++;
            }
        }
        if(this.cnt_white+this.cnt_black == this.size * this.size || this.cnt_white * this.cnt_black == 0){
            return true;
        }
        else return false;
    }
    showBoard(){
        for(let i=0;i<this.size;i++){
            for(let j=0;j<this.size;j++){
                this.changeColor(j,i,this.state[i][j]);
            }
        }
    }
    showResult(){
        let board_background = document.querySelector(".board-background");
        let result_content = document.createElement("h2");
        result_content.textContent = `${this.cnt_white} - ${this.cnt_black} \n`;
        if(this.cnt_white > this.cnt_black) result_content.textContent += "winner : white";
        else if(this.cnt_white == this.cnt_black) result_content.textContent += "draw";
        else result_content.textContent += "winner : black"
        result_content.classList.add('board-result-content');
        board_background.appendChild(result_content);

    }
    legalActions(){
        this.legal_actions = [];
        for(let i=0;i<this.size;i++){
            for(let j=0;j<this.size;j++){
                if(this.state[i][j] == 2) this.state[i][j] = 3;
                if(this.state[i][j] != 3) continue;
                if(this.checkFlip(j,i).length == 0) continue;
                this.legal_actions.push([j,i]);
                this.state[i][j] = 2;
            }
        }
        return this.legal_actions;
    }
    getScore(){
        let score = this.legalActions().length;
        for(let i=0;i<8;i++){
            for(let j=0;j<8;j++){
                if(this.state[i][j] == this.turn) score += scoreBoard[i][j];
            }
        }
        //左上
        if(this.state[0][0] != 2 && this.state[0][0] != 3){
            let myFirst = -1;
            for(let i=0;i<this.size;i++){
                if(this.state[0][i] == 2 || this.state[0][i] == 3) break; 
                if(this.state[0][i] == this.turn){
                    myFirst = i;
                    break;
                }
            }
            if(myFirst != -1){
                let cnt = 0;
                let multiple = 1;
                for(let i=myFirst;i<this.size;i++){
                    if(this.state[0][i] == this.turn) cnt++;
                    else if(this.state[0][i] == 2 || this.state[0][i] == 3)
                    {
                        if(myFirst != 0) multiple = -1;
                        break;
                    }
                    else break;
                }
                score += 3 * cnt * multiple;
            }
            myFirst = -1;
            for(let i=0;i<this.size;i++){
                if(this.state[i][0] == 2 || this.state[i][0] == 3) break; 
                if(this.state[i][0] == this.turn){
                    myFirst = i;
                    break;
                }
            }
            if(myFirst != -1){
                let cnt = 0;
                let multiple = 1;
                for(let i=myFirst;i<this.size;i++){
                    if(this.state[i][0] == this.turn) cnt++;
                    else if(this.state[i][0] == 2 || this.state[i][0] == 3)
                    {
                        if(myFirst != 0) multiple = -1;
                        break;
                    }
                    else break;
                }
                score += 3 * cnt * multiple;
            }
        }
        //右上
        if(this.state[0][this.size-1] != 2 && this.state[0][this.size-1] != 3){
            let myFirst = -1;
            for(let i=0;i<this.size;i++){
                if(this.state[i][this.size-1] == 2 || this.state[i][this.size-1] == 3) break; 
                if(this.state[i][this.size-1] == this.turn) {
                    myFirst = i;
                    break;
                }
            }
            if(myFirst != -1){
                let cnt = 0;
                let multiple = 1;
                for(let i=myFirst;i<this.size;i++){
                    if(this.state[i][this.size-1] == this.turn) cnt++;
                    else if(this.state[i][this.size-1] == 2 || this.state[i][this.size-1] == 3)
                    {
                        if(myFirst != 0)multiple = -1;
                        break;
                    }
                    else break;
                }
                score += 3 * cnt * multiple;
            }

            myFirst = -1;
            for(let i=0;i<this.size;i++){
                if(this.state[0][this.size-1-i] == 2 || this.state[0][this.size-1-i] == 3) break; 
                if(this.state[0][this.size-1-i] == this.turn) {
                    myFirst = i;
                    break;
                }
            }
            if(myFirst != -1){
                let cnt = 0;
                let multiple = 1;
                for(let i=myFirst;i<this.size;i++){
                    if(this.state[0][this.size-1-i] == this.turn) cnt++;
                    else if(this.state[0][this.size-1-i] == 2 || this.state[0][this.size-1-i] == 3)
                    {
                        if(myFirst != 0)multiple = -1;
                        break;
                    }
                    else break;
                }
                score += 3 * cnt * multiple;
            }
        }
        //左下
        if(this.state[this.size-1][0] != 2 && this.state[this.size-1][0] != 3){
            let myFirst = -1;
            for(let i=0;i<this.size;i++){
                if(this.state[this.size-1][i] == 2 || this.state[this.size-1][i] == 3) break; 
                if(this.state[this.size-1][i] == this.turn) {
                    myFirst = i;
                    break;
                }
            }
            if(myFirst != -1){
                let cnt = 0;
                let multiple = 1;
                for(let i=myFirst;i<this.size;i++){
                    if(this.state[this.size-1][i] == this.turn) cnt++;
                    else if(this.state[this.size-1][i] == 2 || this.state[this.size-1][i] == 3)
                    {
                        if(myFirst != 0) multiple = -1;
                        break;
                    }
                    else break;
                }
                score += 3 * cnt * multiple;

                myFirst = -1;
                for(let i=0;i<this.size;i++){
                    if(this.state[this.size-1-i][0] == 2 || this.state[this.size-1-i][0] == 3) break; 
                    if(this.state[this.size-1-i][0] == this.turn) {
                        myFirst = i;
                        break;
                    }
                }
                if(myFirst != -1){
                    let cnt = 0;
                    let multiple = 1;
                    for(let i=myFirst;i<this.size;i++){
                        if(this.state[this.size-1-i][0] == this.turn) cnt++;
                        else if(this.state[this.size-1-i][0] == 2 || this.state[this.size-1-i][0] == 3)
                        {
                            if(myFirst != 0)multiple = -1;
                            break;
                        }
                        else break;
                    }
                    score += 3 * cnt * multiple;
                }
            }
        }
        //右下
        if(this.state[this.size-1][this.size-1] != 2 && this.state[this.size-1][this.size-1] != 3){
            let myFirst = -1;
            for(let i=0;i<this.size;i++){
                if(this.state[this.size-1][this.size-i-1] == 2 || this.state[this.size-1][this.size-i-1] == 3) break; 
                if(this.state[this.size-1][this.size-i-1] == this.turn) {
                    myFirst = i;
                    break;
                }
            }
            if(myFirst != -1){
                let cnt = 0;
                let multiple = 1;
                for(let i=myFirst;i<this.size;i++){
                    if(this.state[this.size-1][this.size-i-1] == this.turn) cnt++;
                    else if(this.state[this.size-1][this.size-i-1] == 2 || this.state[this.size-1][this.size-i-1] == 3)
                    {
                        if(myFirst != 0) multiple = -1;
                        break;
                    }
                    else break;
                }
                score += 3 * cnt * multiple;

                myFirst = -1;
                for(let i=0;i<this.size;i++){
                    if(this.state[this.size-1-i][this.size-1] == 2 || this.state[this.size-1-i][this.size-1] == 3) break; 
                    if(this.state[this.size-1-i][this.size-1] == this.turn) {
                        myFirst = i;
                        break;
                    }
                }
                if(myFirst != -1){
                    let cnt = 0;
                    let multiple = 1;
                    for(let i=myFirst;i<this.size;i++){
                        if(this.state[this.size-1-i][this.size-1] == this.turn) cnt++;
                        else if(this.state[this.size-1-i][this.size-1] == 2 || this.state[this.size-1-i][this.size-1] == 3)
                        {
                            if(myFirst != 0)multiple = -1;
                            break;
                        }
                        else break;
                    }
                    score += 3 * cnt * multiple;
                }
            }
        }
        return score;
    }
}

function miniMaxScore(state,depth){
    if(state.isDone()){
        if(this.turn == 0) return state.cnt_black;
        else return state.cnt_white;
    }
    if(depth == 0){
        return state.getScore();
    }
    let legal_actions = state.legalActions();
    if(legal_actions.length == 0){
        return state.getScore();
    }
    let bestScore = -Infinity;
    for (const pos of legal_actions) {
        let next_state = _.cloneDeep(state);
        next_state.putStone(pos);
        let score = -miniMaxScore(next_state,depth-1);
        if(score > bestScore){
            bestScore = score;
        }
    }

    return bestScore;
}
function miniMaxAction(state,depth){
    // console.log(state);
    let legal_actions = state.legalActions();
    let best_action = legal_actions[0];
    best_score = -Infinity;
    for (const pos of legal_actions) {
        let next_state = _.cloneDeep(state);
        next_state.putStone(pos);
        let score = -miniMaxScore(next_state,depth);
        if(score > best_score){
            best_action = pos;
            best_score = score;
        }
    }
    return best_action;
}


function runAI(state){
    let action;
    console.log(Date());
    if(state.cnt_white + state.cnt_black >= 54)action = miniMaxAction(state,10);
    else action = miniMaxAction(state,4);
    console.log(action);
    state.putStone(action);
}
function pauseInterval(){
    clearInterval(iv_id);
}
function playInterval(state){
    iv_id = setInterval(() => {
        state.showBoard();
        if(state.turn == 1){
            pauseInterval();
            runAI(state);
            playInterval(state);
        }
        if(state.isDone()){
            state.showResult();
            clearInterval(iv_id);
        }
    },100);
}
function playGame(){
    let state = new State(8);
    state.showBoard();
    playInterval(state);
}

playGame();
