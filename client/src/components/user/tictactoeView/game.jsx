import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'reactstrap';
import SkyLight from 'react-skylight';
import { Board } from './board';
import Player from './player';
import Computer from './computer';

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

function calculateWinner(squares) {
  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: i };
    }
  }
  return { player: null, line: null };
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      player1wins: 0,
      player1: '',
      player2wins: 0,
      player2: '',
      winner: '',
      gameInPlay: true,
    };

    this.onReset = this.onReset.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.passBack = this.passBack.bind(this);
  }

  onReset() {
    this.setState({
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      gameInPlay: true,
    }, () => { this.child.resetHotSquareClickCount(); });
  }

  onPlayerChange() {
    this.setState({
      player1wins: 0,
      player2wins: 0,
    }, () => this.onReset());
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (!this.state.gameInPlay || squares[i] || (!this.props.twoPlayers && !this.state.xIsNext)) {
      return;
    }

    squares[i] = this.state.xIsNext ? '╳' : '◯';
    this.setState({
      history: history.concat([
        {
          squares,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    }, () => {
      let winner = calculateWinner(squares);
      if (winner.player === '╳') {
        this.setState({
          player1wins: this.state.player1wins + 1,
          gameInPlay: false,
          winner: this.state.player1,
        });
      } else if (winner.player === '◯') {
        this.setState({
          player2wins: this.state.player2wins + 1,
          gameInPlay: false,
          winner: this.state.player2,
        });
      } else if (!this.props.twoPlayers) {
        let moved = false;
        // try to win
        for (let l = 0; l < lines.length; l += 1) {
          if (/[◯](.*)[◯]/.test(squares[lines[l][0]] + squares[lines[l][1]] + squares[lines[l][2]])) {
            for (let j = 0; j < 3; j += 1) {
              if (squares[lines[l][j]] === null) {
                squares[lines[l][j]] = '◯';
                moved = true;
                break;
              }
            }
            if (moved) break;
          }
        }
        // try to block
        if (!moved) {
          for (let l = 0; l < lines.length; l += 1) {
            if (/[╳](.*)[╳]/.test(squares[lines[l][0]] + squares[lines[l][1]] + squares[lines[l][2]])) {
              for (let j = 0; j < 3; j += 1) {
                if (squares[lines[l][j]] === null) {
                  squares[lines[l][j]] = '◯';
                  moved = true;
                  break;
                }
              }
              if (moved) break;
            }
          }
        }
        if (!moved) {
          // random logic
          const open = [];
          for (let j = 0; j < squares.length; j += 1) {
            if (squares[j] === null) {
              open.push(j);
            }
          }
          squares[open[Math.floor(Math.random() * open.length)]] = '◯';
        }
        // computer moves
        setTimeout(() => (
          this.setState({
            history: history.concat([{ squares }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
          }, () => {
            winner = calculateWinner(squares);
            if (winner.player === '╳') {
              this.setState({
                player1wins: this.state.player1wins + 1,
                gameInPlay: false,
                winner: this.state.player1,
              });
            } else if (winner.player === '◯') {
              this.setState({
                player2wins: this.state.player2wins + 1,
                gameInPlay: false,
                winner: this.state.player2,
              });
            }
          })
        ), 300);
      }
    });
  }

  passBack(name, player) {
    if (player === '╳') {
      this.setState({
        player1: name,
      });
    } else if (player === '◯') {
      this.setState({
        player2: name,
      });
    } else {
      this.setState({
        player2: 'Computer',
      });
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const { history } = this.state;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let status;
    if (winner.player) {
      status = (
        <div className="winner">
          <span className="winnerHeader">Winner: </span>
          {winner.player} {this.state.winner}
        </div>
      );
    } else {
      status = <div> Next player: {this.state.xIsNext ? '╳' : '◯'}</div>;
    }

    return (
      <Container>
        <Row>
          <Col sm={3}>
            <Player
              player="╳"
              wins={this.state.player1wins}
              passBack={this.passBack}
              xnext={this.state.xIsNext && 'x'}
            />
          </Col>
          <Col md={6}>
            <div className="game">
              <div className="game-board">
                <div className="game-info">
                  {status}
                </div>
                <Board
                  squares={current.squares}
                  onClick={i => this.handleClick(i)}
                  unlockForms={this.props.unlockForms}
                  line={winner.line}
                  ref={(reset) => { this.child = reset; }}
                />
                <span>
                  <button id="reset" onClick={this.onReset}>reset</button>
                  <div
                    id="info-button"
                    role="button"
                    tabIndex={0}
                    onClick={() => this.simpleDialog.show()}
                  >
                    <img id="info" src="images/info.png" alt="info" />
                  </div>
                  <SkyLight
                    hideOnOverlayClicked
                    ref={(ref) => { this.simpleDialog = ref; }}
                    title="How To Play"
                  >
                    <div>The object of Tic Tac Toe is to get three in a row.
                    The first player is known as X and the second is O.
                    Players alternate placing Xs and Os on the game board until
                    either oppent has three in a row or all nine squares are filled.
                    In the event that no one has three in a row, the stalemate is called a cat game.
                    </div>
                    <div id="overlay-bug">
                      <div>Did you find a bug?</div>
                      <a href="#login-here">
                        <button
                          onClick={() => { this.props.showLogIn(); this.simpleDialog.hide(); }}
                        >
                        Report it here.
                        </button>
                      </a>
                    </div>
                  </SkyLight>
                </span>
              </div>
            </div>
          </Col>
          <Col sm={3}>
            {this.props.twoPlayers ? (
              <Player
                player="◯"
                wins={this.state.player2wins}
                passBack={this.passBack}
                xnext={!this.state.xIsNext && 'o'}
              />)
            : (<Computer wins={this.state.player2wins} />)}
          </Col>
        </Row>
      </Container>
    );
  }
}

Game.propTypes = {
  unlockForms: PropTypes.func,
  twoPlayers: PropTypes.bool,
  showLogIn: PropTypes.func,
};

Game.defaultProps = {
  unlockForms: () => {},
  twoPlayers: true,
  showLogIn: () => {},
};

export default Game;
