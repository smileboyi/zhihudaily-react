import React from 'react';

export interface AppState {
  detailsSlideIds: number[];
  detailsFromType: 'slide' | 'list';
  sideBarInfo: {
    type: 'list' | 'details' | 'comment';
    data?: any;
  };
}

export type Action = {
  type: string;
  payload?: any;
};

interface AppContextType {
  appState: AppState;
  appDispatch: React.Dispatch<Action>;
}

export const AppContext = React.createContext<AppContextType>({
  appState: {} as AppState,
  appDispatch: () => {}
});
