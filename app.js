import React from 'react';
import ReactDOM from 'react-dom';

import { Dispatcher } from 'flux';
import { Container, ReduceStore } from 'flux/utils';

const dispatcher = new Dispatcher();

// Action
const HistoryAction = {
  push(path, state) {
    dispatcher.dispatch({ type: 'history/push', path, state });
  },
  replace(path, state) {
    dispatcher.dispatch({ type: 'history/replace', path, state });
  },
  pop(path, state) {
    dispatcher.dispatch({ type: 'history/pop', path, state });
  }
};

// Store
class HistoryStore extends ReduceStore {
  getInitialState() {
    return { type: null, path: null, state: null };
  }
  reduce(state, action) {
    switch (action.type) {
      // store the action as a state.
      // that is enough because this app just saves location.path and history.state as a state,
      // which can be restored from location and history anytime.
      case 'history/push':
      case 'history/replace':
      case 'history/pop':
        return action;
      default:
        return state;
    }
  }
}

const historyStore = new HistoryStore(dispatcher);

const Link = (props) => (
  <a
    href={props.to}
    onClick={(e) => {
      e.preventDefault();
      HistoryAction.push(props.to);
    }}
  >
    {props.children}
  </a>
);

const Foo = () => (
  <div>
    <h1>Foo</h1>
    <Link to="/">top</Link>
  </div>
);

const Bar = () => (
  <div>
    <h1>Bar</h1>
    <Link to="/">top</Link>
  </div>
);

const App = Container.create(class App extends React.Component {
  static getStores() {
    return [historyStore];
  }
  static calculateState() {
    return { history: historyStore.getState() };
  }
  render() {
    switch (this.state.history.path) {
      case '/foo':
        return <Foo />;
      case '/bar':
        return <Bar />;
      default:
        return (
          <div>
            <h1>App</h1>
            <ul>
              <li><Link to="/foo">foo</Link></li>
              <li><Link to="/bar">bar</Link></li>
            </ul>
          </div>
        );
    }
  }
});

// code depending on the DOM environment
// handle popstate event
window.addEventListener('popstate', (e) => {
  HistoryAction.pop(location.pathname, history.state);
});
// update browser history
historyStore.addListener(() => {
  const { type, state, path } = historyStore.getState();
  switch (type) {
    case 'history/push':
      history.pushState(state, null, path);
      break;
    case 'history/replace':
      history.replaceState(state, null, path);
      break;
  }
});
// manage current history in historyStore and window.history
HistoryAction.replace(location.pathname, history.state);

ReactDOM.render(<App />, document.getElementById('app'));
