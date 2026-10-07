import React from 'react';
import {ArrowRight} from '@phosphor-icons/react';
import poster from './assets/freja/shop-poster.jpg';
import './shop-film.css';

export default function ShopFilm({onExplore}){
 return <section className="shop-film" aria-label="The everyday edit">
  <div className="shop-film-visual"><video autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label="Freja models three everyday outfits"><source src={new URL('./assets/freja/shop-film.mp4',import.meta.url).href} type="video/mp4"/></video></div>
  <div className="shop-film-copy"><p className="eyebrow">THE EVERYDAY EDIT</p><h2>See it before<br/> you choose.</h2><p>Try it on your photo or a Twin. Pair it with your wardrobe before you decide.</p><button className="small-link" onClick={onExplore}>Explore the dress <ArrowRight/></button><small>Freja · AI fashion inspiration</small></div>
 </section>
}
