import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  function Square(props) {
    console.log(props.isWin)
    return (
        <button
          className={"square " + (props.isWin ? "" : "gray")}
          onClick={props.onClick}
        >
          {props.value}
        </button>
      );
  }

  class Moves extends React.Component {
    render(){
      const history = this.props.history;
      var moves = history.map((step, move) =>{
        const description = move ?
          'Go to move #' + move + ' (' + step.row + '|' + step.col + ')':
          'Go to game start';
        return (
        <li key={move} className={(move === this.props.stepNumber ? 'step selected' : 'step')}>
          <button onClick={() => this.props.jumpTo(move)}>{description}</button>
        </li>
        )
      })
      if (!this.props.asc)
        moves.reverse()
   
      return (
        <ol>{moves}</ol>
      )
    }
  }
  
  class Board extends React.Component {
    renderSquare(i, isWin) {
      return( 
        <Square 
          key = {i}
          value={this.props.squares[i]}
          onClick={() => this.props.onClick(i)}
          isWin = {isWin}
        />
      );
    }
  
    render() {
      const winningMove = this.props.winningMove.slice()
      return (<div>
        {
          [0,1,2].map((i) => <div className="board-row" key={i}>
            {[0,1,2].map((j) => {
                const p = i*3 + j
                var isWin = true
                if (winningMove[0] !== null & !winningMove.includes(p)) 
                  isWin = false
                return this.renderSquare(p, isWin)
                })
            }
            </div>)
        }
      </div>);
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          history: [{
            squares: Array(9).fill(null),
            row: null,
            col: null,
          }],
          stepNumber: 0,
          xIsNext: true,
          sortMoveListAsc: true,
          winningMove: Array(3).fill(null),
        }
    }

    updateWinningMove(winningMove) {
      this.setState({
        winningMove: winningMove
      })

    }
    handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      var winningMove = calculateWinner(squares)
      
      if(winningMove[0] !== null || squares[i]) {
        return;
      }

      //update moves
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          row: row(i),
          col: col(i),
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      })

      winningMove = calculateWinner(squares)
      if (winningMove[0] !== null ){
        this.updateWinningMove(winningMove)
        return
      }
    }

    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
    }

    toggleMoveList() {
      this.setState({
        sortMoveListAsc: !this.state.sortMoveListAsc,
      })
    }

    newGame(){
      this.setState({
        history: [{
          squares: Array(9).fill(null),
          row: null,
          col: null,
        }],
        stepNumber: 0,
        xIsNext: true,
        sortMoveListAsc: true,
        winningMove: Array(3).fill(null),
      })
    }

    render() {
      var jumpTo = this.jumpTo;
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winningMove = calculateWinner(current.squares);

      let status;
      if (winningMove[0] !== null ) {
        status = 'Winner: ' + current.squares[winningMove[0]];
      } else if (!current.squares.includes(null)) {
        status = "Draw"
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }

      return (
        <div className="game">
          <div className="game-board">
            <Board 
              squares={current.squares}
              onClick= {(i) => this.handleClick(i)}
              winningMove={winningMove}
            />
          </div>
          <div className="game-info">
            <div className="status">{status}</div>
            <button className="op" onClick={()=>this.toggleMoveList()}>Sort Steps</button>
            <button className="op" onClick={()=>this.newGame()}>New Game</button>
            <Moves 
              history={this.state.history} 
              stepNumber={this.state.stepNumber}
              jumpTo={jumpTo.bind(this)}
              asc={this.state.sortMoveListAsc}
            />
          </div>
        </div>
      );
    }
  }
  

  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );

  function row(i) {
    if ([0,1,2].includes(i))
      return 1
    else if ([3,4,5].includes(i))
      return 2
    else
      return 3
  }

  function col(i) {
    if ([0,3, 6].includes(i))
      return 1
    else if ([1,4,7].includes(i))
      return 2
    else
      return 3
  }

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [a,b,c];
      }
    }
    return Array(3).fill(null);
  }