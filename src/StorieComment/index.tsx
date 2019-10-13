import React, { memo, useMemo, useState, useContext, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import ReactSVG from 'react-svg';

import { AppContext } from './../context';
import fold from './fold.svg';
import like from './like.svg';
import './index.scss';

interface Comment {
  author: string;
  content: string;
  avatar: string;
  time: number;
  id: number;
  likes: number;
}

const StorieComment: React.FC = memo(() => {
  const [longComments, setLongComments] = useState<Comment[]>([]);
  const [shortComments, setShortComments] = useState<Comment[]>([]);
  const { appState, appDispatch } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const { id } = useParams<{
    id: string;
  }>();
  const history = useHistory();
  const location = useLocation();
  const style: React.CSSProperties = useMemo(
    () =>
      open
        ? {}
        : {
            height: 0,
            visibility: 'hidden',
            overflow: 'hidden'
          },
    [open]
  );

  useEffect(() => {
    // 如果页面刷新，data没有时的情况
    if (!appState.sideBarInfo.data) {
      appDispatch({
        type: 'SET_SIDEBAR_INFO',
        payload: {
          type: 'comment',
          data: {}
        }
      });
    }
    axios
      .get(`https://zhihu-daily.leanapp.cn/api/v1/contents/${id}/long-comments`)
      .then(res => {
        if (res.status === 200) {
          setLongComments(res.data.COMMENTS.comments);
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
      });
    axios
      .get(
        `https://zhihu-daily.leanapp.cn/api/v1/contents/${id}/short-comments`
      )
      .then(res => {
        if (res.status === 200) {
          setShortComments(res.data.COMMENTS.comments);
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
      });
  }, []);

  return (
    <div className="storie-comment fe ovh">
      <div className="comment-box h100 ovys">
        <div className="head">
          <span className="text">{longComments.length}条长评</span>
        </div>
        <div className="list">
          {longComments.map((item, i) => (
            <div className="item" key={i}>
              <i
                className="avatar"
                style={{ backgroundImage: `url(${item.avatar})` }}
              />
              <div className="main">
                <div className="bar">
                  <span className="name">{item.author}</span>
                  <span className="like">
                    <ReactSVG className="like-svg" src={like}></ReactSVG>
                    {item.likes}
                  </span>
                </div>
                <div className="content">{item.content}</div>
                <div className="datetime">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="head" id="shortCommentsBae">
          <span className="text">{shortComments.length}条短评</span>
          <ReactSVG
            className="fold-svg"
            src={fold}
            style={{
              transform: `rotate(${open ? 0 : 180}deg)`
            }}
            onClick={() => {
              setOpen(!open);
              // 不要使用<a href />和history.push，返回键要按2下
              history.replace(location.pathname + '#shortCommentsBae');
            }}
          ></ReactSVG>
        </div>
        <div className="list" style={style}>
          {shortComments.map((item, i) => (
            <div className="item" key={i}>
              <i
                className="avatar"
                style={{ backgroundImage: `url(${item.avatar})` }}
              />
              <div className="main">
                <div className="bar">
                  <span className="name">{item.author}</span>
                  <span className="like">
                    <ReactSVG className="like-svg" src={like}></ReactSVG>
                    {item.likes}
                  </span>
                </div>
                <div className="content">{item.content}</div>
                <div className="datetime">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default StorieComment;
