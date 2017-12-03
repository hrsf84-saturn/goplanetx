import React from 'react';
import PropTypes from 'prop-types';

function Square(props) {
  return (
    <button className={`square${props.value ? '-pop' : ''}`} onClick={props.onClick}>
      {props.line === true ? <div className="vertical line" /> : null}
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hotSquareClickCount: 0,
    };
  }

  resetHotSquareClickCount() {
    this.setState({
      hotSquareClickCount: 0,
    });
  }

  incrementHotSquareClickCount() {
    this.state.hotSquareClickCount += 1;
    if (this.state.hotSquareClickCount === 10) {
      this.props.unlockForms();
      this.state.hotSquareClickCount = 0;
    }
  }

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        line={i < 3 && this.props.line - 3 === i}
      />
    );
  }

  renderHotSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => {
          this.incrementHotSquareClickCount();
          this.props.onClick(i);
        }}
      />);
  }

  render() {
    return (
      <div className="board">
        <div className="board-row">
          {this.props.line === 6 ? <div className="diagonal line" /> : null}
          {this.props.line === 0 ? <div className="line" /> : null}
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.props.line === 1 ? <div className="line" /> : null}
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.props.line === 7 ? <div className="backward diagonal line" /> : null}
          {this.props.line === 2 ? <div className="line" /> : null}
          {this.renderHotSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

Square.propTypes = {
  onClick: PropTypes.func.isRequired,
  value: PropTypes.string,
  line: PropTypes.bool,
};

Square.defaultProps = {
  value: null,
  line: false,
};

Board.propTypes = {
  onClick: PropTypes.func.isRequired,
  unlockForms: PropTypes.func.isRequired,
  squares: PropTypes.arrayOf(PropTypes.string).isRequired,
  line: PropTypes.number,
};

Board.defaultProps = {
  line: null,
};

export {
  Board,
  Square,
};
