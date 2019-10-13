import React, {
  memo,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import Slider from 'react-slick';

import { AppContext } from './../context';
import Loading from './../Loading/index';
import './index.scss';

interface Article {
  image: string;
  title: string;
  body: string;
  image_source: string;
}

const DetailsContent: React.SFC<{
  article: Article;
}> = memo(({ article }) => {
  return (
    <>
      <div className="header pre">
        <img className="wh100 cover2 nobd" src={article.image} alt="" />
        <h4 className="title pab nol">{article.title}</h4>
        <span className="img-source pab nob nor">{article.image_source}</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: article.body }}></div>
    </>
  );
});

let routeId: number;

const StorieDetails: React.FC = memo(() => {
  const [article, setArticle] = useState<Article>({} as Article);
  const [type, setType] = useState<'left' | 'center' | 'right'>('center');
  const [slideIndex, setSlideIndex] = useState(1);
  const { appState, appDispatch } = useContext(AppContext);

  const history = useHistory();
  const routeParams = useParams<{
    type: string;
    id: string;
  }>();

  const fetchDetailsData = useCallback((id: number) => {
    axios
      .get('https://zhihu-daily.leanapp.cn/api/v1/contents/' + id)
      .then(res => {
        if (res.status === 200) {
          setArticle(res.data.CONTENTS);
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
      });
    axios
      .get('https://zhihu-daily.leanapp.cn/api/v1/contents/extra/' + id)
      .then(res => {
        if (res.status === 200) {
          appDispatch({
            type: 'SET_SIDEBAR_INFO',
            payload: {
              type: 'details',
              data: {
                comments: res.data.DES.comments,
                popularity: res.data.DES.popularity,
                detailsId: id
              }
            }
          });
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
      });
  }, []);

  const moveSlide = useCallback((index: number) => {
    if (index === 0) {
      setType('left');
      setSlideIndex(0);
    } else if (index === appState.detailsSlideIds.length - 1) {
      setType('right');
      setSlideIndex(2);
    } else {
      setType('center');
      setSlideIndex(1);
    }
  }, []);

  const settings = useMemo(() => {
    return {
      dots: false,
      infinite: false,
      autoplay: false,
      arrows: false,
      initialSlide: slideIndex,
      beforeChange: function(oldIndex: number, newIndex: number) {
        if (oldIndex !== newIndex) {
          let index = appState.detailsSlideIds.indexOf(routeId);
          index = index - oldIndex + newIndex;
          routeId = appState.detailsSlideIds[index];
          fetchDetailsData(routeId);
          history.replace('/article/list/' + routeId);
          moveSlide(index);
        }
      }
    };
  }, [slideIndex]);

  useEffect(() => {
    appDispatch({
      type: 'SET_SIDEBAR_INFO',
      payload: {
        type: 'details',
        data: {
          comments: '...',
          popularity: '...',
          detailsId: routeParams.id
        }
      }
    });
    routeId = parseInt(routeParams.id);
    fetchDetailsData(routeId);

    // slide定位
    let index = appState.detailsSlideIds.indexOf(routeId);
    moveSlide(index);
  }, []);

  // 如果页面刷新
  if (!appState.detailsSlideIds.length) {
    return (
      <div className="storie-details fe">
        <DetailsContent article={article}></DetailsContent>
      </div>
    );
  }

  // 由于slide和list有一些文章重复，所以不对slide文章做滑动翻页处理
  return routeParams.type === 'list' ? (
    <>
      {type === 'left' && (
        <Slider {...settings} className="details-page-slider">
          <div className="storie-details">
            <DetailsContent article={article}></DetailsContent>
          </div>
          <div className="storie-details">
            <Loading></Loading>
          </div>
          <div className="storie-details">
            <Loading></Loading>
          </div>
        </Slider>
      )}
      {type === 'center' && (
        <Slider {...settings} className="details-page-slider">
          <div className="storie-details">
            <Loading></Loading>
          </div>
          <div className="storie-details">
            <DetailsContent article={article}></DetailsContent>
          </div>
          <div className="storie-details">
            <Loading></Loading>
          </div>
        </Slider>
      )}
      {type === 'right' && (
        <Slider {...settings} className="details-page-slider">
          <div className="storie-details">
            <Loading></Loading>
          </div>
          <div className="storie-details">
            <Loading></Loading>
          </div>
          <div className="storie-details">
            <DetailsContent article={article}></DetailsContent>
          </div>
        </Slider>
      )}
    </>
  ) : (
    <div className="storie-details fe">
      <DetailsContent article={article}></DetailsContent>
    </div>
  );
});

export default StorieDetails;
