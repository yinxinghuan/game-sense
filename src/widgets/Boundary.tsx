import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; onSkip: () => void; }
interface State { err: Error | null; }

/** Catches a render/runtime error in a question so it never blanks the screen.
 *  Give it key={question.id} so it resets each question. */
export default class Boundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  render() {
    if (this.state.err) {
      return (
        <div className="qErr">
          <div className="qErrTitle">⚠️ THIS ONE GLITCHED</div>
          <div className="qErrMsg">{String(this.state.err?.message || this.state.err)}</div>
          <button className="btn mag big" style={{ width: '100%' }} onClick={this.props.onSkip}>
            SKIP ▸
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
