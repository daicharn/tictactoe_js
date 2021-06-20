let symbol = "";
let count = 0;
let count_max = 9;
let flag_play = true;
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
            //背景色を固定
            cell.style.backgroundColor = 'rgb(216, 216, 216)';

            //勝ち
            if(isWinner()){
                result_str.innerHTML = "<p>" + symbol + "の勝ち<p>";
                flag_play = false;
            }
            //継続
            else if(count < count_max){
                //入れ替え
                if(symbol === "○"){
                    symbol = "×";
                }
                else{
                    symbol = "○";
                }

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

//先手を設定する
function setFirstSymbol(){
    symbol = select_first.value;
    select_first.disabled = true;
}

//勝敗の判定
function isWinner(){
    //縦横の判定
    for(let i = 0; i < 3; i++){
        //縦
        let var_1 = cells[i].innerText;
        let var_2 = cells[3 + i].innerText;
        let var_3 = cells[6 + i].innerText;
        //横
        let hor_1 = cells[3 * i].innerText;
        let hor_2 = cells[3 * i + 1].innerText;
        let hor_3 = cells[3 * i + 2].innerText;

        //縦の判定
        if(var_1 === var_2 && var_2 === var_3 && var_1 !== ""){
            return true;
        }
        //横の判定
        if(hor_1 === hor_2 && hor_2 === hor_3 && hor_1 !== ""){
            return true;
        }
    }

    //斜め
    let cell_0 = cells[0].innerText;
    let cell_2 = cells[2].innerText;
    let cell_4 = cells[4].innerText;
    let cell_6 = cells[6].innerText;
    let cell_8 = cells[8].innerText;
    
    //斜めの判定
    if(cell_0 === cell_4 && cell_4 === cell_8 && cell_0 !== ""){
        return true;
    }
    if(cell_2 === cell_4 && cell_4 === cell_6 && cell_2 !== ""){
        return true;
    }

    return false;
}

//リセット
function clearBoard(){
    symbol = "";
    count = 0;
    flag_play = true;
    select_mode.disabled = false;
    select_first.disabled = false;

    result_str.innerHTML = "";

    //すべてのマスの記号と背景色をリセット
    for(let i = 0; i < cells.length; i++){
        cells[i].innerText = "";
        cells[i].style.backgroundColor = 'rgb(240, 240, 240)';
    }
}


