import jsmediatags from "jsmediatags";

export interface AudioMetadata {
  title: string | null;
  artist: string | null;
  album: string | null;
  year: string | null;
  genre: string | null;
  duration: number | null;
  cover: string | null;
}

function getAudioDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();

    audio.preload = "metadata";

    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
    });

    audio.addEventListener("error", () => {
      resolve(null);
    });

    audio.src = url;
  });
}

export async function getAudioMetadata(
  url: string
): Promise<AudioMetadata> {
  const duration = await getAudioDuration(url);

  return new Promise((resolve) => {
    jsmediatags.read(url, {
      onSuccess: (result) => {
        const tags = result.tags;

        let cover: string | null = null;

        if (tags.picture) {
          const { data, format } = tags.picture;

          const bytes = new Uint8Array(data);
          const blob = new Blob([bytes], { type: format });

          cover = URL.createObjectURL(blob);
        }

        resolve({
          title: tags.title || null,
          artist: tags.artist || null,
          album: tags.album || null,
          year: tags.year || null,
          genre: tags.genre || null,
          duration,
          cover,
        });
      },

      onError: () => {
        resolve({
          title: null,
          artist: null,
          album: null,
          year: null,
          genre: null,
          duration,
          cover: null,
        });
      },
    });
  });
}