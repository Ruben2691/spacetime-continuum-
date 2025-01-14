import { useRef, useState } from "react";
import Globe from "react-globe.gl";
import "./Homepage.css";

const mapboxKey = import.meta.env.VITE_MAPBOX_API_KEY;
const wiki = "https://en.wikipedia.org/w/api.php";
const wiki_url = "https://en.wikipedia.org";

function Homepage() {
  const globeRef = useRef();
  const [latCoord, setLatCoord] = useState(180);
  const [lngCoord, setLngCoord] = useState(90);
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState({}); // Tracks save state for each article

  const handleGlobeClick = (coords) => {
    const { lat, lng } = coords;
    setLatCoord(lat);
    setLngCoord(lng);
  };

  const handleClear = () => {
    setArticles([]);
  };

  const submitForInfo = async () => {
    const newLat = parseFloat(latCoord.toFixed(7));
    const newLng = parseFloat(lngCoord.toFixed(7));

    const mapUrl = "https://api.mapbox.com";
    const search = `/geocoding/v5/mapbox.places/${newLng},${newLat}.json`;

    const res = await fetch(`${mapUrl}${search}?access_token=${mapboxKey}`, {
      credentials: "omit",
    });

    if (!res.ok) {
      console.error("Failed to fetch data", res.status, res.statusText);
      return;
    }

    const data = await res.json();
    const placeName = data.features[0].place_name;
    const formatPlace = placeName.split(",");
    const isUSPlace = formatPlace.length > 2;
    const addressObj = {
      city: isUSPlace ? formatPlace[1] : formatPlace[0],
      state: isUSPlace ? formatPlace[2] : null,
      country: isUSPlace ? formatPlace[3] : formatPlace[1],
    };

    const query = `?action=query&format=json&list=search&srsearch=${addressObj.city},${addressObj.country}%20historical%20events&origin=*`;

    const histRes = await fetch(`${wiki}${query}`, {
      credentials: "omit",
    });

    const histData = await histRes.json();
    setArticles(histData.query.search);
  };

  const saveToFavorites = async (link, pageid) => {
    try {
      const payload = link;

      const response = await fetch("/api/links/save-favorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save the link");
      }

      // Update the save state for the specific article
      setSavedArticles((prev) => ({ ...prev, [pageid]: true }));

      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error saving favorite:", error.message);
    }
  };

  return (
    <div className="homepage">
      <div className="globe-container">
        <Globe
          ref={globeRef}
          width={1000}
          globeImageUrl="http://s3-us-west-2.amazonaws.com/s.cdpn.io/1206469/earthmap1k.jpg"
          onGlobeClick={(coords) => handleGlobeClick(coords)}
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        />
      </div>
      <div className="info-panel">
        <div className="get-info-controls">
          <input type="text" readOnly value={latCoord} />
          <input type="text" readOnly value={lngCoord} />
          <button onClick={submitForInfo}>Get Info</button>
          <button onClick={handleClear}>Clear Results</button>
        </div>
        {articles.length > 0 && (
          <div className="articles">
            {articles.map((art) => (
              <div key={art.pageid} className="article-item">
                <h2>{art.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: art.snippet }} />
                <a
                  href={`${wiki_url}/wiki?curid=${art.pageid}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read more
                </a>
                {savedArticles[art.pageid] ? (
                  <h3>Successfully Saved!</h3>
                ) : (
                  <button
                    className="save-btn"
                    onClick={(e) => {
                      const linkElement = e.target
                        .closest(".article-item")
                        .querySelector("a");
                      const titleElement = e.target
                        .closest(".article-item")
                        .querySelector("h2");
                      if (linkElement && titleElement) {
                        const link = linkElement.href;
                        const title = titleElement.textContent;
                        const payload = { link, title };
                        saveToFavorites(payload, art.pageid);
                      }
                    }}
                  >
                    <span>Save to Favorites</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;
