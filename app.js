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
    return { histories: {}, type: null, id: 0 };
  }
  reduce(state, action) {
    const {histories, id} = state;
    let newId = id + 1;
    switch (action.type) {
      case 'history/push':
        return {
          id: newId,
          type: action.type,
          histories: Object.assign(
            {}, state.histories, { [newId]: { path: action.path, state: action.state } }
          )
        };
      case 'history/replace':
        return {
          id,
          type: action.type,
          histories: Object.assign(
            {}, state.histories, { [id]: { path: action.path, state: action.state } }
          )
        };
      case 'history/pop':
        if (action.state.id) {
          newId = action.state.id;
        }
        return {
          id: newId,
          type: action.type,
          histories: Object.assign(
            {}, { [newId]: { path: action.path, state: action.state } }, state.histories
          )
        };
      default:
        return state;
    }
  }
  getCurrentHistory() {
    const { id, histories } = this.getState();
    return histories[id];
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

class App extends React.Component {
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
}
App.getStores = () => {
  return [historyStore];
};
App.calculateState = () => {
  return { history: historyStore.getCurrentHistory() };
};
App = Container.create(App);

// handle popstate event
window.addEventListener('popstate', (e) => {
  HistoryAction.pop(location.pathname, history.state);
});

// update browser history
historyStore.addListener(() => {
  const { type, id } = historyStore.getState();
  const { path } = historyStore.getCurrentHistory();

  switch (type) {
    case 'history/push':
      history.pushState({ id }, null, path);
      break;
    case 'history/replace':
      history.replaceState({ id }, null, path);
      break;
  }
});

// manage current history in historyStore and window.history
HistoryAction.replace(location.pathname, history.state);

ReactDOM.render(<App />, document.getElementById('app'));
