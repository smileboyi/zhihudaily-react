import React, { memo, useMemo, useContext } from 'react';
import { withRouter, useHistory } from 'react-router-dom';
import ReactSVG from 'react-svg';

import { AppContext } from './../context';
import comment from './comment.svg';
import back from './back.svg';
import like from './like.svg';
import './index.scss';

const SideBar: React.FC = memo(() => {
  const { appState, appDispatch } = useContext(AppContext);

  const history = useHistory();

  const fromType = useMemo(() => {
    return appState.sideBarInfo.type;
  }, [appState.sideBarInfo]);

  const initData = useMemo(() => {
    return appState.sideBarInfo.data;
  }, [appState.sideBarInfo]);

  return (
    <div className="page-sidebar">
      {fromType === 'list' && <span>首页</span>}
      {fromType === 'details' && (
        <>
          <div className="left">
            <ReactSVG
              className="sidebar-svg"
              src={back}
              onClick={() => {
                history.go(-1);
              }}
            ></ReactSVG>
          </div>
          <div className="right">
            <label
              className="group"
              onClick={() => {
                appDispatch({
                  type: 'SET_SIDEBAR_INFO',
                  payload: {
                    type: 'comment',
                    data: initData
                  }
                });
                history.push('/comment/' + initData.detailsId);
              }}
            >
              <ReactSVG
                className="sidebar-svg message"
                src={comment}
              ></ReactSVG>
              <span className="text">{initData.comments}</span>
            </label>
            <label className="group">
              <ReactSVG className="sidebar-svg" src={like}></ReactSVG>
              <span className="text">{initData.popularity}</span>
            </label>
          </div>
        </>
      )}
      {fromType === 'comment' && (
        <div className="left">
          {initData.detailsId ? (
            <>
              <ReactSVG
                className="sidebar-svg"
                src={back}
                onClick={() => {
                  history.go(-1);
                }}
              ></ReactSVG>
              <span className="title">{initData.comments}条评论</span>
            </>
          ) : (
            <ReactSVG
              className="sidebar-svg"
              src={back}
              onClick={() => {
                history.push('/');
              }}
            ></ReactSVG>
          )}
        </div>
      )}
    </div>
  );
});

export default withRouter(SideBar);
