import React, {
  memo,
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useLayoutEffect
} from 'react';
import { Link } from 'react-router-dom';
import BScroll from '@better-scroll/core';
import PullDown from '@better-scroll/pull-down';
import Pullup from '@better-scroll/pull-up';
import axios, { AxiosError } from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { AppContext, Action } from './../context';
import './index.scss';

BScroll.use(PullDown);
BScroll.use(Pullup);

interface Storie {
  title: string;
  ga_prefix: string;
  id: number;
  type: number;
  image?: string;
  images?: string[];
}

type ListItem = {
  date: string;
  data: Storie[];
};

const initialState = {
  fetchDate: '',
  topStories: [] as Storie[],
  listStories: [] as ListItem[]
};

type State = typeof initialState;

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'GET_TOP_STORIES':
      return {
        ...state,
        topStories: action.payload
      };
    case 'ADD_FIRST_LIST_STORIES':
      return {
        ...state,
        listStories: [action.payload]
      };
    case 'ADD_MORE_LIST_STORIES':
      const listStories = state.listStories.map(item => item);
      listStories.push(action.payload);
      return {
        ...state,
        listStories
      };
    case 'RESET_LIST_STORIES_DATA':
      return {
        ...state,
        listStories: []
      };
    case 'SET_FETCH_DATE':
      return {
        ...state,
        fetchDate: action.payload
      };
    case 'LOAD_CACHE_DATA':
      return {
        ...state,
        ...action.payload
      };
    default:
      throw state;
  }
}

const day = ['日', '一', '二', '三', '四', '五', '六'];
interface CacheData {
  pageData: State;
  srollTop: number;
}

let stateRef: State;
let globalSrollTop: number;

const formatDate = (dateStr: string) => {
  let d = new Date();
  d.setFullYear(Number.parseInt(dateStr.substr(0, 4)));
  d.setMonth(Number.parseInt(dateStr.substr(4, 2)) - 1);
  d.setDate(Number.parseInt(dateStr.substr(6, 2)));
  return d.getMonth() + 1 + '月' + d.getDate() + '日 星期' + day[d.getDay()];
};

const StoriesList: React.FC = memo(() => {
  const fetchDateRef = useRef('');
  const [refreshing, setRefreshing] = useState(false);
  const [state, dispatch]: [State, React.Dispatch<Action>] = useReducer(
    reducer,
    initialState
  );
  stateRef = state;
  const { appDispatch } = useContext(AppContext);
  const settings = useMemo(() => {
    return {
      dots: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 3000,
      arrows: false
    };
  }, []);

  const bScrollConfig = useMemo(() => {
    return {
      click: true,
      scrollY: true,
      pullDownRefresh: {
        threshold: 50,
        stop: 0
      },
      pullUpLoad: {
        threshold: 0
      },
      probeType: 3
    };
  }, []);

  const firstFetchStories = useCallback(() => {
    appDispatch({
      type: 'RESET_SLIDEIDS_ARR'
    });
    axios
      .get('https://zhihu-daily.leanapp.cn/api/v1/last-stories')
      .then(res => {
        setRefreshing(false);
        if (res.status === 200) {
          setRefreshing(false);
          const STORIES = res.data.STORIES;
          dispatch({
            type: 'GET_TOP_STORIES',
            payload: STORIES.top_stories
          });
          dispatch({
            type: 'SET_FETCH_DATE',
            payload: STORIES.date
          });
          dispatch({
            type: 'ADD_FIRST_LIST_STORIES',
            payload: {
              data: STORIES.stories,
              date: '今日热闻'
            }
          });
          fetchDateRef.current = STORIES.date;
          const ids = STORIES.stories.map((item: Storie) => item.id);
          appDispatch({
            type: 'ADD_SLIDEIDS_ARR_ID',
            payload: ids
          });
          localStorage.setItem('storiesIds', JSON.stringify(ids));
          fetchMoreStories(STORIES.date);
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
        setRefreshing(false);
      });
  }, []);

  const fetchMoreStories = useCallback(fetchDate => {
    axios
      .get('https://zhihu-daily.leanapp.cn/api/v1/before-stories/' + fetchDate)
      .then(res => {
        setRefreshing(false);
        if (res.status === 200) {
          const STORIES = res.data.STORIES;
          dispatch({
            type: 'SET_FETCH_DATE',
            payload: STORIES.date
          });
          dispatch({
            type: 'ADD_MORE_LIST_STORIES',
            payload: {
              data: STORIES.stories,
              date: formatDate(STORIES.date)
            }
          });
          fetchDateRef.current = STORIES.date;
          const ids = STORIES.stories.map((item: Storie) => item.id);
          appDispatch({
            type: 'ADD_SLIDEIDS_ARR_ID',
            payload: ids
          });
          let storiesIds = localStorage.getItem('storiesIds') || '[]';
          storiesIds = JSON.parse(storiesIds).concat(ids);
          localStorage.setItem('storiesIds', JSON.stringify(ids));
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
        setRefreshing(false);
      });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch({
      type: 'RESET_LIST_STORIES_DATA'
    });
    localStorage.setItem('storiesListCacheData', '');
    firstFetchStories();
  }, []);

  useEffect(() => {
    appDispatch({
      type: 'SET_SIDEBAR_INFO',
      payload: {
        type: 'list'
      }
    });
    const cacheDataStr = localStorage.getItem('storiesListCacheData');
    if (!cacheDataStr) {
      firstFetchStories();
    } else {
      const cacheDataObj: CacheData = JSON.parse(cacheDataStr);
      fetchDateRef.current = cacheDataObj.pageData.fetchDate;
      globalSrollTop = cacheDataObj.srollTop;
      dispatch({
        type: 'LOAD_CACHE_DATA',
        payload: cacheDataObj.pageData
      });
      const storiesIds = localStorage.getItem('storiesIds') || '[]';
      appDispatch({
        type: 'ADD_SLIDEIDS_ARR_ID',
        payload: JSON.parse(storiesIds)
      });
    }
  }, []);

  useLayoutEffect(() => {
    let bScroll: BScroll = new BScroll('.stories-list', bScrollConfig);
    // 滚动要求：wrapper height < scroll height
    // console.log(bScroll.hasVerticalScroll)
    bScroll.on('pullingDown', () => {
      handleRefresh();
      bScroll.finishPullDown();
      let t = setTimeout(() => {
        bScroll.refresh();
        clearTimeout(t);
      }, 500);
    });
    bScroll.on('pullingUp', () => {
      // 由于闭包的原因导致useState fetchDate获取不了新值，
      // 需要添加依赖，但这样又导致bScroll多次初始化和事件绑定。
      fetchMoreStories(fetchDateRef.current);
      bScroll.finishPullUp();
      let t = setTimeout(() => {
        bScroll.refresh();
        clearTimeout(t);
      }, 500);
    });
    bScroll.on('scrollEnd', (e: { x: number; y: number }) => {
      globalSrollTop = e.y;
    });
    if (globalSrollTop) {
      let t = setTimeout(() => {
        clearTimeout(t);
        bScroll.maxScrollY = globalSrollTop;
        bScroll.scrollTo(0, globalSrollTop, 0, {}, true);
      }, 200);
    }
    return () => {
      bScroll.destroy();
      localStorage.setItem(
        'storiesListCacheData',
        JSON.stringify({
          pageData: stateRef,
          srollTop: globalSrollTop
        })
      );
    };
  }, []);

  return (
    <div className="stories-list fe ovys">
      <div style={{ minHeight: 'calc(100% + 1px)' }}>
        <Slider {...settings} className="slider w100 ovh">
          {state.topStories.map((item, i) => (
            <Link className="slide" key={i} to={`/article/slide/${item.id}`}>
              <img className="slide-img" src={item.image} alt="" />
              <span className="slide-text">{item.title}</span>
            </Link>
          ))}
        </Slider>
        {state.listStories.map((section, i) => (
          <div className="stories-section" key={i}>
            <div className="head-title">{section.date}</div>
            <div className="list">
              {section.data.map((item, j) => (
                <Link className="item" key={j} to={`/article/list/${item.id}`}>
                  <span className="text">{item.title}</span>
                  <img src={item.images && item.images[0]} alt="" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default StoriesList;
