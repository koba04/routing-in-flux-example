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
  pop(id) {
    dispatcher.dispatch({ type: 'history/pop', id });
  }
};

// Store
class HistoryStore extends ReduceStore {
  getInitialState() {
    return { histories: [{}], type: null, id: 0 };
  }
  reduce(state, action) {
    const {histories, id} = state;
    switch (action.type) {
      case 'history/push':
        const newId = id + 1;
        const newHistories = histories.slice(0, newId);
        newHistories.push({id: newId, path: action.path, state: action.state || null});
        return {
          id: newId,
          type: action.type,
          histories: newHistories
        };
      case 'history/replace':
        return {
          id,
          type: action.type,
          histories: [
            ...histories.slice(0, id),
            { id, path: action.path, state: action.state || null },
            ...histories.slice(id + 1),
          ]
        };
      case 'history/pop':
        return {
          id: action.id,
          type: action.type,
          histories,
        };
      default:
        return state;
    }
  }
  getLastActionType() {
    return this.getState().type;
  }
  getHistoryById(id) {
    const { histories } = this.getState();
    return histories[id];
  }
  getCurrentHistory() {
    const { id } = this.getState();
    return this.getHistoryById(id);
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
  // restore a current history state from historyStore by id in the history.state
  if (history.state && historyStore.getHistoryById(history.state.id)) {
    HistoryAction.pop(history.state.id);
  }
});

// update browser history
historyStore.addListener(() => {
  const { id, path } = historyStore.getCurrentHistory();
  const type = historyStore.getLastActionType();

  switch (type) {
    case 'history/push':
      history.pushState({ id }, null, path);
      break;
    case 'history/replace':
      history.replaceState({ id }, null, path);
      break;
  }
});

// initialize HistoryStore by current location
HistoryAction.replace(location.pathname, null);

ReactDOM.render(<App />, document.getElementById('app'));
