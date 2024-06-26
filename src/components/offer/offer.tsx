import CardsList from '../card/cards-list';
import Header from '../header';
import { Offer } from '../../types/offers';
import { useParams } from 'react-router-dom';
import Error404 from '../404';
import ReviewForm from './review-form';
import ReviewsList from './review-list';
import Map from '../map/map';
import {
  fetchSingleOfferAction,
  fetchСommentsAction,
  updateFavorite,
} from '../../api/api-actions';
import LoadingScreen from '../loading-screen';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { useEffect } from 'react';
import { AuthorizationStatus, FavoritesStatus } from '../../const';
import { useState } from 'react';
import { updateFavoritesCount } from '../../store/action';
import { setOffersDataLoadingStatus } from '../../store/action';

type OfferProps = {
  offers: Offer[];
};

function OfferScreen({ offers }: OfferProps): JSX.Element {
  const isAuthorized = useAppSelector(
    (state) => state.user.authorizationStatus
  );
  const params = useParams();
  const offer = offers.find((o) => o.id === params.id);
  const favoritesCounter = useAppSelector(
    (state) => state.favorite.favoritesCounter
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (offer?.id) {
      dispatch(fetchSingleOfferAction({ id: offer.id }));
      dispatch(fetchСommentsAction({ id: offer.id }));
      dispatch(setOffersDataLoadingStatus(false));
    }
  }, [dispatch, offer?.id]);
  const currentOffer = useAppSelector((state) => state.offers.currentOffer);
  const [isFavorite, setIsFavorite] = useState(offer?.isFavorite);
  function handleIsFavorite() {
    if (isFavorite) {
      dispatch(
        updateFavorite({
          id: currentOffer?.id,
          status: FavoritesStatus.DELETE,
        })
      );
      setIsFavorite(false);
      dispatch(updateFavoritesCount(favoritesCounter - 1));
    } else {
      dispatch(
        updateFavorite({
          id: currentOffer?.id,
          status: FavoritesStatus.ADD,
        })
      );
      setIsFavorite(true);
      dispatch(updateFavoritesCount(favoritesCounter + 1));
    }
  }
  const currentComments = useAppSelector(
    (state) => state.offers.currentComments
  );
  if (!offer) {
    return <Error404 />;
  }
  if (!currentOffer) {
    return <LoadingScreen />;
  }

  const otherOffers = offers.filter((e) => e !== offer);
  const firstThreeOffers = otherOffers.slice(0, 3);
  const points = firstThreeOffers.concat(offer).map((item) => ({
    id: item.id,
    title: item.title,
    lat: item.location.latitude,
    lng: item.location.longitude,
  }));
  const selectedPoint = points.find((o) => o.title === offer.title);


  const offerImages = currentOffer?.images.map((item, i) => {
    const photoAlt = `Photo studio ${i}`;
    return (
      <div className="offer__image-wrapper" key={`${photoAlt}`}>
        <img className="offer__image" src={item} alt={photoAlt}></img>
      </div>
    );
  });

  const features = [
    currentOffer?.type
      .toLowerCase()
      .replace(/\w/, (firstLetter) => firstLetter.toUpperCase()),
    `${currentOffer?.bedrooms} ${currentOffer?.bedrooms > 1 ? 'Bedrooms' : 'Bedroom' }`,
    `Max ${currentOffer?.maxAdults} ${currentOffer?.maxAdults > 1 ? 'adults' : 'adult' }`,
  ];

  const offerFeatures = features.map((item) => (
    <li className="offer__feature offer__feature--entire" key={`${item}`}>
      {item}
    </li>
  ));

  const offerInside = currentOffer?.goods.map((item) => (
    <li className="offer__inside-item" key={`${item}`}>
      {item}
    </li>
  ));

  let authorizedSection;
  if (isAuthorized === AuthorizationStatus.Auth) {
    authorizedSection = (
      <button
        className={
          isFavorite
            ? 'offer__bookmark-button offer__bookmark-button--active button'
            : 'offer__bookmark-button button'
        }
        type="button"
        onClick={handleIsFavorite}
      >
        <svg className="offer__bookmark-icon" width="31" height="33">
          <use href="#icon-bookmark"></use>
        </svg>
        <span className="visually-hidden">To Bookmarks</span>
      </button>
    );
  }

  return (
    <div className="page">
      <Header />

      <main className="page__main page__main--offer">
        <section className="offer">
          <div className="offer__gallery-container container">
            <div className="offer__gallery">{offerImages}</div>
          </div>

          <div className="offer__container container">
            <div className="offer__wrapper">
              <div className="offer__mark">
                <span>{currentOffer?.isPremium ? 'Premium' : 'Economy'}</span>
              </div>
              <div className="offer__name-wrapper">
                <h1 className="offer__name">{currentOffer?.title}</h1>
                {authorizedSection}
              </div>
              <div className="offer__rating rating">
                <div className="offer__stars rating__stars">
                  <span style={{ width: '80%' }}></span>
                  <span className="visually-hidden">Rating</span>
                </div>
                <span className="offer__rating-value rating__value">
                  {offer.rating}
                </span>
              </div>
              <ul className="offer__features">{offerFeatures}</ul>
              <div className="offer__price">
                <b className="offer__price-value">&euro;{`${offer.price}`}</b>
                <span className="offer__price-text">&nbsp;night</span>
              </div>
              <div className="offer__inside">
                <h2 className="offer__inside-title">What&apos;s inside</h2>
                <ul className="offer__inside-list">{offerInside}</ul>
              </div>
              <div className="offer__host">
                <h2 className="offer__host-title">Meet the host</h2>
                <div className="offer__host-user user">
                  <div className="offer__avatar-wrapper offer__avatar-wrapper--pro user__avatar-wrapper">
                    <img
                      className="offer__avatar user__avatar"
                      src={currentOffer?.host.avatarUrl}
                      width="74"
                      height="74"
                      alt="Host avatar"
                    >
                    </img>
                  </div>
                  <span className="offer__user-name">
                    {currentOffer?.host.name}
                  </span>
                  <span className="offer__user-status">
                    {currentOffer?.host.isPro ? 'Pro' : 'New'}
                  </span>
                </div>
                <div className="offer__description">
                  <p className="offer__text">{currentOffer?.description}</p>
                </div>
              </div>
              <section className="offer__reviews reviews">
                <ReviewsList reviews={currentComments} />
                <ReviewForm offerId={currentOffer.id} />
              </section>
            </div>
          </div>
          <section className="offer__map map">
            <Map
              city={currentOffer?.city}
              points={points}
              selectedPoint={selectedPoint}
              className={'offer__map map'}
            />
          </section>
        </section>
        <div className="container">
          <section className="near-places places">
            <h2 className="near-places__title">
              Other places in the neighbourhood
            </h2>
            <div className="near-places__list places__list">
              <CardsList
                cards={firstThreeOffers.map((item) => ({
                  id: item.id,
                  price: item.price,
                  rating: item.rating,
                  isFavorite: item.isFavorite,
                  roomName: item.title,
                  roomType: item.type,
                  image: item.previewImage,
                }))}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default OfferScreen;
