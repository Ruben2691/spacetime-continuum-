import { useRef } from "react";
import { useState } from "react";
import Globe from "react-globe.gl";
import "./Homepage.css";

const mapboxKey = import.meta.env.VITE_MAPBOX_API_KEY;
const wiki = "https://en.wikipedia.org/w/api.php";
const wiki_url = "https://en.wikipedia.org";

function Homepage() {
  const globeRef = useRef();
  // const [dataPoint, setDataPoint] = useState({ lat: 180, lng: 360 });
  const [latCoord, setLatCoord] = useState(180);
  const [lngCoord, setLngCoord] = useState(90);
  const [articles, setArticles] = useState([]);

  const handleGlobeClick = (coords) => {
    const { lat, lng } = coords;
    console.log(`Latitude: ${lat}, Longitude: ${lng} `);
    setLatCoord(lat);
    setLngCoord(lng);
  };

  const submitForInfo = async () => {
    const newLat = parseFloat(latCoord.toFixed(7));
    const newLng = parseFloat(lngCoord.toFixed(7));

    const mapUrl = "https://api.mapbox.com";
    const search = `/geocoding/v5/mapbox.places/${newLng},${newLat}.json`;

    const res = await fetch(`${mapUrl}${search}?access_token=${mapboxKey}`, {
      credentials: "omit"
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
      country: isUSPlace ? formatPlace[3] : formatPlace[1]
    };

    const query = `?action=query&format=json&list=search&srsearch=${addressObj.city},${addressObj.country}%20historical%20events&origin=*`;

    const histRes = await fetch(`${wiki}${query}`, {
      credentials: "omit"
    });

    const histData = await histRes.json();
    console.log(histData);
    setArticles(histData.query.search);
    // console.log(addressObj);
  };

  return (
    <div className="homepage">
        <Globe
            classnname="globe"
            ref={globeRef}
            width={1000}
            // ringsData={gData}
            ringLat={latCoord}
            ringLng={lngCoord}
            // onGlobeClick={({ lat, lng }) => handleGlobeClick(lat, lng)}
            globeImageUrl="http://s3-us-west-2.amazonaws.com/s.cdpn.io/1206469/earthmap1k.jpg"
            onGlobeClick={(coords) => handleGlobeClick(coords)}
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        />

      <div className="get-info-button">
        <input type="text" readOnly value={latCoord} />
        <input type="text" readOnly value={lngCoord} />
        <button onClick={submitForInfo}>Get Info</button>
      </div>

      {articles.length > 0 && (
        <section style={{ padding: "0 20px" }}>
          {articles.map((art) => (
            <div className="article-list">
              <h2>{art.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: art.snippet }} />
              <a
                href={`${wiki_url}/wiki?curid=${art.pageid}`}
                target="_blank"
                rel="norel"
              >
                Read more
              </a>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default Homepage;