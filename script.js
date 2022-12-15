const COUNT_MAX = 9;

const SYMBOL_TYPE = {
    maru: 0,
    batsu: 1,
    empty: 2
}

let symbol = "";
let count = 0;
let flag_play = true;
//ボードの配列
let board_array = new Array(9).fill(SYMBOL_TYPE.empty);

let select_first = document.getElementById("select_first");
let select_mode = document.getElementById("select_mode");
let result_str = document.getElementById("result");

//リセットボタンのイベント登録
let button_reset = document.getElementById("button_reset");
button_reset.addEventListener("click", clearBoard);

//ボードのイベント登録
let cells = document.getElementsByClassName("cell");
for(let i = 0; i < cells.length; i++){
    cells[i].addEventListener("click",(event) =>{
        let cell = event.target;

        //先手を決める
        if(count === 0){
            setFirstSymbol();
            select_mode.disabled = true;
        }

        //記号が既に配置済みでないかつゲームプレイ中であること
        if(cell.innerText === "" && flag_play){
            //カウントを進める
            count++;
            //記号を配置
            cell.innerText = symbol;
            //ボードの配列に代入
            board_array[i] = convertSymbolToNumber(symbol);
            //背景色を固定
            cell.style.backgroundColor = 'rgb(216, 216, 216)';

            //勝ち
            if(getWinner() !== ""){
                result_str.innerHTML = "<p>" + symbol + "の勝ち<p>";
                flag_play = false;
            }
            //継続
            else if(count < COUNT_MAX){
                //入れ替え
                symbol = getEnemySymbol(symbol);

                //ゲームモードによる処理
                if(count % 2 === 1){
                    //CPU(ランダム)
                    if(select_mode.value === "cpu_random"){
                        while(true){
                            let num = Math.floor(Math.random() * 9);
                            if(cells[num].innerText === ""){
                                cells[num].click();
                                break;
                            }
                        }
                    }
                    //CPU(難しい)
                    else if(select_mode.value === "cpu_difficult"){
                        //ミニマックス法（アルファベータカットを含む）で最善手を打つ
                        let num = minimaxab(5);
                        cells[num].click();
                    }
                }
            }
            //引き分け終了
            else{
                result_str.innerHTML = "<p>引き分け<p>";
                flag_play = false;
            }
        }
    });
}

//記号（〇×）を数値に変換する
function convertSymbolToNumber(symbol){
    if(symbol == "○"){
        return SYMBOL_TYPE.maru;
    }
    else if(symbol == "×"){
        return SYMBOL_TYPE.batsu;
    }
}

//ミニマックス法（アルファベータカットを含む）を用いて最善の手を算出
function minimaxab(depth){
    let point = 0;
    let eval = -99;
    let eval_max = -99;
    for(let i = 0; i < cells.length; i++){
        if(cells[i].innerText === ""){
            //手を打つ
            board_array[i] = convertSymbolToNumber(symbol);

            //最善手を探索
            eval = minlevel(0, depth, eval_max);

            //手を戻す
            board_array[i] = SYMBOL_TYPE.empty;

            if(eval > eval_max){
                eval_max = eval;
                point = i;
            }

            console.log(i + " " + eval);
        }
    }

    return point;
}

//評価関数
function evaluate(depth){
    //CPUの勝ち
    if(getWinner() === convertSymbolToNumber(symbol)){
        return 10 - depth;
    }
    //プレイヤーの勝ち
    else if(getWinner() === convertSymbolToNumber(getEnemySymbol())){
        return depth - 10;
    }
    //引き分け
    else{
        return 0;
    }
}

//コンピュータの手を見つける
function maxlevel(level, depth, eval_min){

    if(level >= depth || getWinner() !== ""){
        return evaluate(depth);
    }

    let score,score_max = 0;
    let first = true;
    for(let i = 0; i < cells.length; i++){
        if(board_array[i] === SYMBOL_TYPE.empty){
            //手を打つ
            board_array[i] = convertSymbolToNumber(symbol);
            //初回のみは無条件で探索を行う
            if(first){
                //評価を算出
                score = minlevel(level + 1, depth, -99);
            }
            //初回以外は現在のスコアが上の層の最小値より既に高ければ探索を中止して現在のスコアを返す
            else{
                if(score_max > eval_min){
                    //console.log("max", level, depth, i, score_max, eval_min);
                    //手を戻す
                    board_array[i] = SYMBOL_TYPE.empty;
                    return score_max;
                }
                else{
                    //評価を算出
                    score = minlevel(level + 1, depth, score_max);
                }
            }

            //手を戻す
            board_array[i] = SYMBOL_TYPE.empty;

            if(first){
                score_max = score;
                first = false;
            }

            //コンピュータにとって良い手が見つかった
            else if(score > score_max){
                score_max = score;
            }
        }
    }

    return score_max;
}

//プレイヤーの手を見つける
function minlevel(level, depth, eval_max){
    
    if(level >= depth || getWinner() !== ""){
        return evaluate(depth);
    }

    let score,score_min = 0;
    let first = true;
    for(let i = 0; i < cells.length; i++){
        if(board_array[i] === SYMBOL_TYPE.empty){
            //手を打つ
            board_array[i] = convertSymbolToNumber(getEnemySymbol());

            //初回のみは無条件で探索を行う
            if(first){
                //評価を算出
                score = maxlevel(level + 1, depth, 99);
            }
            //初回以外は現在のスコアが上の層の最大値より既に低ければ探索を中止して現在のスコアを返す
            else{
                if(score_min < eval_max){
                    //console.log("min", level, depth, i, score_min, eval_max);
                    //手を戻す
                    board_array[i] = SYMBOL_TYPE.empty;
                    return score_min;
                }
                else{
                    //評価を算出
                    score = maxlevel(level + 1, depth, score_min);
                }
            }

            //手を戻す
            board_array[i] = SYMBOL_TYPE.empty;

            if(first){
                score_min = score;
                first = false;
            }

            //上の層の現在の最大値よりも

            //最悪の手（相手にとって良い手）が見つかった
            else if(score < score_min){
                score_min = score;
            }
        }
    }

    return score_min;
}

//コンピュータのコマを取得
function getEnemySymbol(){
    if(symbol === "○"){
        return "×";
    }
    else{
        return "○";
    }
}


//先手の記号を取得する
function getFirstSymbol(){
    return select_first.value;
}

//先手を設定する
function setFirstSymbol(){
    symbol = getFirstSymbol();
    select_first.disabled = true;
}


//勝敗の判定
function getWinner(){
    //縦横の判定
    for(let i = 0; i < 3; i++){
        //縦
        let var_1 = board_array[i];
        let var_2 = board_array[3 + i];
        let var_3 = board_array[6 + i];
        //横
        let hor_1 = board_array[3 * i];
        let hor_2 = board_array[3 * i + 1];
        let hor_3 = board_array[3 * i + 2];

        //縦の判定
        if(var_1 === var_2 && var_2 === var_3 && var_1 !== SYMBOL_TYPE.empty){
            return var_1;
        }
        //横の判定
        if(hor_1 === hor_2 && hor_2 === hor_3 && hor_1 !== SYMBOL_TYPE.empty){
            return hor_1;
        }
    }

    //斜め
    let cell_0 = board_array[0];
    let cell_2 = board_array[2];
    let cell_4 = board_array[4];
    let cell_6 = board_array[6];
    let cell_8 = board_array[8];
    
    //斜めの判定
    if(cell_0 === cell_4 && cell_4 === cell_8 && cell_0 !== SYMBOL_TYPE.empty){
        return cell_0;
    }
    if(cell_2 === cell_4 && cell_4 === cell_6 && cell_2 !== SYMBOL_TYPE.empty){
        return cell_2;
    }

    return "";
}

//リセット
function clearBoard(){
    symbol = "";
    count = 0;
    flag_play = true;
    select_mode.disabled = false;
    select_first.disabled = false;

    result_str.innerHTML = "";

    //ボードの配列をリセット
    board_array.fill(SYMBOL_TYPE.empty);

    //すべてのマスの記号と背景色をリセット
    for(let i = 0; i < cells.length; i++){
        cells[i].innerText = "";
        cells[i].style.backgroundColor = 'rgb(240, 240, 240)';
    }
}


