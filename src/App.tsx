import React, { lazy, Suspense, useReducer } from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import StoriesList from '../src/StoriesList/index';
import SideBar from '../src/SideBar/index';
import Loading from '../src/Loading/index';
import { AppContext, AppState, Action } from './context';

let LazyStorieDetails = lazy(() => import('./StorieDetails/index'));
let LazyStorieComment = lazy(() => import('../src/StorieComment/index'));

const StorieDetails: React.FC = () => (
  <Suspense fallback={<Loading />}>
    <LazyStorieDetails></LazyStorieDetails>
  </Suspense>
);
const StorieComment: React.FC = () => (
  <Suspense fallback={<Loading />}>
    <LazyStorieComment></LazyStorieComment>
  </Suspense>
);

const initialState: AppState = {
  detailsSlideIds: [],
  detailsFromType: 'slide',
  sideBarInfo: {
    type: 'list'
  }
};

function reducer(state: AppState, action: Action) {
  switch (action.type) {
    case 'ADD_SLIDEIDS_ARR_ID':
      const detailsSlideIds = state.detailsSlideIds.concat(action.payload);
      return {
        ...state,
        detailsSlideIds
      };
    case 'RESET_SLIDEIDS_ARR':
      return {
        ...state,
        detailsSlideIds: []
      };
    case 'SET_DETAILS_FROM_TYPE':
      return {
        ...state,
        detailsFromType: action.payload
      };
    case 'SET_SIDEBAR_INFO':
      return {
        ...state,
        sideBarInfo: action.payload
      };
    default:
      throw state;
  }
}

const App: React.FC = () => {
  const [appState, appDispatch]: [
    AppState,
    React.Dispatch<Action>
  ] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ appState, appDispatch }}>
      <BrowserRouter>
        <div className="App h5w wauto h100 grail">
          <SideBar></SideBar>
          <Switch>
            <Route exact path="//" component={StoriesList}></Route>
            <Route path="/article/:type/:id" component={StorieDetails}></Route>
            <Route path="/comment/:id" component={StorieComment}></Route>
          </Switch>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
};

export default App;
