import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className="square"
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onSquareClick(i)}/>
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    PLAYER = Object.freeze({X: {id: 1, symbol: 'X'}, O: {id: 2, symbol: 'O'}});

    constructor(props) {
        super(props);

        this.state = {
            history: [Array(9).fill(null)],
            squares: Array(9).fill(null),
            playerTurn: this.initPlayerRandomly(),
            playerWon: null,
            step: 0
        };
    }

    handleSquareClick(i) {
        const updatedState = this.restoreHistoryAndState(this.state.step);

        const squares = updatedState.squares;
        const history = updatedState.history;
        const playerTurn = updatedState.playerTurn;

        // If in winning state don't let additional moves
        if (this.state.playerWon || squares[i]) return;

        const updatedStateSquares = squares.slice();
        updatedStateSquares[i] = playerTurn? playerTurn.symbol : this.state.playerTurn.symbol;

        // Update next step
        const step = this.state.step + 1;

        // Update History
        const updatedHistory = history.concat([updatedStateSquares]);

        this.checkForTerminalState(checkBoardPlayerWinning(updatedStateSquares));
        this.setState(
            {
                step: step,
                history: updatedHistory,
                squares: updatedStateSquares,
                playerTurn: playerTurn ? playerTurn : this.swapPlayerTurn()
            });
    }

    restoreHistoryAndState(step) {
        let updatedPlayerTurn;
        let updatedHistory = this.state.history.slice();
        let updatedSquares = this.state.squares.slice();

        // Do only if step is smaller than history
        if (step < updatedHistory.length - 1) {
            updatedHistory = updatedHistory.slice(0, step + 1);
            updatedSquares = updatedHistory[step];
        }

        return {
            playerTurn: updatedPlayerTurn,
            history: updatedHistory,
            squares: updatedSquares
        };
    }

    initPlayerRandomly() {
        const randomPlayer = Number((Math.random() + 1).toFixed());
        return Object.values(this.PLAYER).find(value => value.id === randomPlayer);
    }

    swapPlayerTurn() {
        switch (this.state.playerTurn) {
            case this.PLAYER.O:
                return this.PLAYER.X;
            case this.PLAYER.X:
                return this.PLAYER.O;
            default:
                console.error('No player is in Turn');
                break;
        }
    }

    checkForTerminalState(player) {
        const allSquaresFilled = this.state.squares.filter(square => square == null).length === 0;

        if (player === 'none' || allSquaresFilled) {
            return;
        }

        const playerWon = Object.values(this.PLAYER).find(pl => pl.symbol === player);
        this.setState({playerWon: playerWon});
    }

    updateStatusMessage() {
        let status = 'Next player: ' + this.state.playerTurn.symbol;

        if (this.state.playerWon !== null) {
            status = `Player ${this.state.playerWon.symbol} WON!`;
        }

        return status;
    }

    restoreHistoryInBoard(historyIndex) {
        const squares = this.state.squares;
        let updatedPlayerTurn;

        // Restore player turn
        const numberOfXMoves = squares.filter(move => move === 'X').length;
        const numberOfOMoves = squares.filter(move => move === 'O').length;

        if (numberOfXMoves > numberOfOMoves) {
            updatedPlayerTurn = this.PLAYER.O;
        }
        else {
            updatedPlayerTurn = this.PLAYER.X;
        }

        this.setState({playerTurn: updatedPlayerTurn, step: historyIndex});
    }

    render() {
        const history = this.state.history;
        const currentState = this.state.history[this.state.step];
        const gameStatus = this.updateStatusMessage();

        const moves =
            history.map((value, index) => {
                const description = index === 0 ? `Go to game start` : `Go to move ${index}`;

                return (
                    <li key={`move-${index}`}>
                        <button onClick={() => this.restoreHistoryInBoard(index)}>{description}</button>
                    </li>
                );
            });


        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={currentState}
                        onSquareClick={(i) => this.handleSquareClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{gameStatus}</div>
                    <ol>
                        {moves}
                    </ol>
                </div>
            </div>
        );
    }
}

function checkBoardPlayerWinning(states) {
    const winningStates = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 4, 8],
        [2, 4, 6],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8]
    ];

    let playerWon = 'none';
    let consecutivePlayerXsymbols = 0;
    let consecutivePlayerOsymbols = 0;
    for (const stateCombination of winningStates) {
        for (const state of stateCombination) {
            if (states[state] === 'X') {
                consecutivePlayerXsymbols++;
            } else if (states[state] === 'O') {
                consecutivePlayerOsymbols++;
            }
        }

        if (consecutivePlayerXsymbols === 3) {
            playerWon = 'X';
            break;
        } else if (consecutivePlayerOsymbols === 3) {
            playerWon = 'O';
            break;
        } else {
            consecutivePlayerXsymbols = 0;
            consecutivePlayerOsymbols = 0;
        }

        if (playerWon !== 'none') break;
    }

    return playerWon;
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
