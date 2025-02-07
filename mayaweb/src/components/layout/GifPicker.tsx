import React, { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { IGif } from '@giphy/js-types';
import { SyntheticEvent } from 'react';

const giphyFetch = new GiphyFetch('RZapbrQlcITlLSnO8D9hVIc8C6jawily');

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGifs = (offset: number) =>
    searchTerm
      ? giphyFetch.search(searchTerm, { offset, limit: 10 })
      : giphyFetch.trending({ offset, limit: 10 });

  const handleGifClick = (gif: IGif) => {
    // Utiliser l'URL du GIF à taille fixe
    const gifUrl = gif.images.fixed_height.url;
    onSelect(gifUrl);
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Rechercher un GIF..."
        className="w-full p-2 mb-4 border rounded-lg"
      />
      <div className="h-96 overflow-y-auto">
        <Grid
          onGifClick={handleGifClick}
          fetchGifs={fetchGifs}
          width={350}
          columns={2}
          gutter={6}
          noLink={true}
          hideAttribution={true}
        />
      </div>
    </div>
  );
};

export default GifPicker;